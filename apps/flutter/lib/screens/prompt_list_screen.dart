import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../models/prompt.dart';
import '../providers/prompt_provider.dart';
import '../services/copy_history_service.dart';

class PromptListScreen extends StatefulWidget {
  const PromptListScreen({super.key});

  @override
  State<PromptListScreen> createState() => _PromptListScreenState();
}

class _PromptListScreenState extends State<PromptListScreen> {
  final _searchController = TextEditingController();
  String? _selectedCategoryId;
  final Set<String> _selectedIds = {};
  bool _selectionMode = false;
  String? _copiedId;
  final _copyHistory = CopyHistoryService();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<Prompt> _filterLocal(List<Prompt> prompts) {
    var result = prompts;
    final query = _searchController.text.trim().toLowerCase();
    if (query.isNotEmpty) {
      result = result
          .where(
            (p) =>
                p.title.toLowerCase().contains(query) ||
                p.content.toLowerCase().contains(query) ||
                p.tags.any((t) => t.toLowerCase().contains(query)),
          )
          .toList();
    }
    if (_selectedCategoryId != null && _selectedCategoryId!.isNotEmpty) {
      result =
          result.where((p) => p.categoryId == _selectedCategoryId).toList();
    }
    return result;
  }

  Future<void> _copyPrompt(Prompt prompt) async {
    await Clipboard.setData(ClipboardData(text: prompt.content));
    await _copyHistory.addEntry(
      CopyHistoryEntry(
        promptId: prompt.id,
        title: prompt.title,
        content: prompt.content,
        copiedAt: DateTime.now(),
      ),
    );
    if (!mounted) return;
    await context.read<PromptProvider>().incrementUsage(prompt.id);
    setState(() => _copiedId = prompt.id);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('已复制「${prompt.title}」')),
      );
    }
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted && _copiedId == prompt.id) {
        setState(() => _copiedId = null);
      }
    });
  }

  Future<void> _copySelected(List<Prompt> filtered) async {
    final selected = filtered.where((p) => _selectedIds.contains(p.id)).toList();
    if (selected.isEmpty) return;

    final combined = selected.map((p) => p.content).join('\n\n---\n\n');
    await Clipboard.setData(ClipboardData(text: combined));
    if (!mounted) return;
    final promptProvider = context.read<PromptProvider>();
    for (final p in selected) {
      await _copyHistory.addEntry(
        CopyHistoryEntry(
          promptId: p.id,
          title: p.title,
          content: p.content,
          copiedAt: DateTime.now(),
        ),
      );
      await promptProvider.incrementUsage(p.id);
    }

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('已批量复制 ${selected.length} 条 Prompt')),
      );
      setState(() {
        _selectionMode = false;
        _selectedIds.clear();
      });
    }
  }

  Future<void> _deleteSelected() async {
    if (_selectedIds.isEmpty) return;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('确认删除'),
        content: Text('确定删除选中的 ${_selectedIds.length} 条 Prompt 吗？'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('取消'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('删除'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      await context.read<PromptProvider>().deletePrompts(_selectedIds.toList());
      setState(() {
        _selectionMode = false;
        _selectedIds.clear();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PromptProvider>();
    final filtered = _filterLocal(provider.prompts);

    return Scaffold(
      appBar: AppBar(
        title: Text(_selectionMode ? '已选 ${_selectedIds.length} 项' : 'Prompt 列表'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/'),
        ),
        actions: [
          if (_selectionMode) ...[
            IconButton(
              tooltip: '批量复制',
              icon: const Icon(Icons.copy_all),
              onPressed: () => _copySelected(filtered),
            ),
            IconButton(
              tooltip: '批量删除',
              icon: const Icon(Icons.delete_outline),
              onPressed: _deleteSelected,
            ),
            IconButton(
              icon: const Icon(Icons.close),
              onPressed: () => setState(() {
                _selectionMode = false;
                _selectedIds.clear();
              }),
            ),
          ] else ...[
            IconButton(
              tooltip: '复制历史',
              icon: const Icon(Icons.history),
              onPressed: () => _showCopyHistory(context),
            ),
            IconButton(
              tooltip: '多选',
              icon: const Icon(Icons.checklist),
              onPressed: () => setState(() => _selectionMode = true),
            ),
            IconButton(
              tooltip: '新建',
              icon: const Icon(Icons.add),
              onPressed: () => context.push('/prompts/new'),
            ),
          ],
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: '搜索 Prompt...',
                      prefixIcon: const Icon(Icons.search),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      isDense: true,
                    ),
                    onChanged: (_) => setState(() {}),
                    onSubmitted: (_) {
                      provider.search(
                        query: _searchController.text.trim(),
                        categoryId: _selectedCategoryId,
                      );
                    },
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filledTonal(
                  onPressed: () {
                    provider.search(
                      query: _searchController.text.trim(),
                      categoryId: _selectedCategoryId,
                    );
                  },
                  icon: const Icon(Icons.search),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: DropdownButtonFormField<String?>(
              value: _selectedCategoryId,
              decoration: InputDecoration(
                labelText: '分类筛选',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                isDense: true,
              ),
              items: [
                const DropdownMenuItem(value: null, child: Text('全部分类')),
                ...provider.categories.map(
                  (c) => DropdownMenuItem(value: c.id, child: Text(c.name)),
                ),
              ],
              onChanged: (v) {
                setState(() => _selectedCategoryId = v);
                provider.search(
                  query: _searchController.text.trim(),
                  categoryId: v,
                );
              },
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: provider.loading && provider.prompts.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : filtered.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.folder_open,
                              size: 48,
                              color: Theme.of(context)
                                  .colorScheme
                                  .onSurfaceVariant,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              provider.prompts.isEmpty
                                  ? '还没有任何 Prompt'
                                  : '没有找到匹配的 Prompt',
                            ),
                            if (provider.prompts.isEmpty) ...[
                              const SizedBox(height: 16),
                              FilledButton(
                                onPressed: () => context.push('/prompts/new'),
                                child: const Text('创建第一个 Prompt'),
                              ),
                            ],
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: provider.loadAll,
                        child: ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: filtered.length,
                          itemBuilder: (context, index) {
                            final prompt = filtered[index];
                            final selected = _selectedIds.contains(prompt.id);

                            return Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              child: InkWell(
                                borderRadius: BorderRadius.circular(12),
                                onTap: () {
                                  if (_selectionMode) {
                                    setState(() {
                                      if (selected) {
                                        _selectedIds.remove(prompt.id);
                                      } else {
                                        _selectedIds.add(prompt.id);
                                      }
                                    });
                                  } else {
                                    context.push('/prompts/${prompt.id}');
                                  }
                                },
                                onLongPress: () {
                                  if (!_selectionMode) {
                                    setState(() {
                                      _selectionMode = true;
                                      _selectedIds.add(prompt.id);
                                    });
                                  }
                                },
                                child: Padding(
                                  padding: const EdgeInsets.all(16),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          if (_selectionMode)
                                            Padding(
                                              padding: const EdgeInsets.only(
                                                right: 12,
                                                top: 2,
                                              ),
                                              child: Icon(
                                                selected
                                                    ? Icons.check_circle
                                                    : Icons
                                                        .radio_button_unchecked,
                                                color: selected
                                                    ? Theme.of(context)
                                                        .colorScheme
                                                        .primary
                                                    : null,
                                              ),
                                            ),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  prompt.title,
                                                  style: Theme.of(context)
                                                      .textTheme
                                                      .titleMedium
                                                      ?.copyWith(
                                                        fontWeight:
                                                            FontWeight.w600,
                                                      ),
                                                ),
                                                const SizedBox(height: 4),
                                                Text(
                                                  prompt.content,
                                                  maxLines: 2,
                                                  overflow:
                                                      TextOverflow.ellipsis,
                                                  style: TextStyle(
                                                    color: Theme.of(context)
                                                        .colorScheme
                                                        .onSurfaceVariant,
                                                  ),
                                                ),
                                                if (prompt.tags.isNotEmpty) ...[
                                                  const SizedBox(height: 8),
                                                  Wrap(
                                                    spacing: 6,
                                                    runSpacing: 4,
                                                    children: prompt.tags
                                                        .map(
                                                          (t) => Chip(
                                                            label: Text(t),
                                                            visualDensity:
                                                                VisualDensity
                                                                    .compact,
                                                            materialTapTargetSize:
                                                                MaterialTapTargetSize
                                                                    .shrinkWrap,
                                                          ),
                                                        )
                                                        .toList(),
                                                  ),
                                                ],
                                              ],
                                            ),
                                          ),
                                          if (!_selectionMode)
                                            Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                IconButton(
                                                  tooltip: '复制',
                                                  icon: Icon(
                                                    _copiedId == prompt.id
                                                        ? Icons.check
                                                        : Icons.copy,
                                                    color: _copiedId ==
                                                            prompt.id
                                                        ? Colors.green
                                                        : null,
                                                  ),
                                                  onPressed: () =>
                                                      _copyPrompt(prompt),
                                                ),
                                                IconButton(
                                                  tooltip: '编辑',
                                                  icon: const Icon(
                                                    Icons.edit_outlined,
                                                  ),
                                                  onPressed: () => context
                                                      .push(
                                                    '/prompts/${prompt.id}',
                                                  ),
                                                ),
                                              ],
                                            ),
                                        ],
                                      ),
                                      const SizedBox(height: 8),
                                      Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            '使用 ${prompt.usageCount} 次',
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodySmall,
                                          ),
                                          Text(
                                            _formatDate(prompt.createdAt),
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodySmall,
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime dt) {
    return '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}';
  }

  Future<void> _showCopyHistory(BuildContext context) async {
    final history = await _copyHistory.getHistory();
    if (!context.mounted) return;

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (ctx) {
        return DraggableScrollableSheet(
          expand: false,
          initialChildSize: 0.6,
          minChildSize: 0.3,
          maxChildSize: 0.9,
          builder: (_, controller) {
            return Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '复制历史',
                        style: Theme.of(ctx).textTheme.titleLarge,
                      ),
                      if (history.isNotEmpty)
                        TextButton(
                          onPressed: () async {
                            await _copyHistory.clearHistory();
                            if (ctx.mounted) Navigator.pop(ctx);
                          },
                          child: const Text('清空'),
                        ),
                    ],
                  ),
                ),
                Expanded(
                  child: history.isEmpty
                      ? const Center(child: Text('暂无复制记录'))
                      : ListView.builder(
                          controller: controller,
                          itemCount: history.length,
                          itemBuilder: (_, i) {
                            final entry = history[i];
                            return ListTile(
                              title: Text(entry.title),
                              subtitle: Text(
                                entry.content,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              trailing: IconButton(
                                icon: const Icon(Icons.copy),
                                onPressed: () async {
                                  await Clipboard.setData(
                                    ClipboardData(text: entry.content),
                                  );
                                  if (ctx.mounted) {
                                    ScaffoldMessenger.of(ctx).showSnackBar(
                                      const SnackBar(content: Text('已复制')),
                                    );
                                  }
                                },
                              ),
                            );
                          },
                        ),
                ),
              ],
            );
          },
        );
      },
    );
  }
}
