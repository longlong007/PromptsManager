import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../models/category.dart';
import '../models/prompt.dart';
import '../providers/prompt_provider.dart';
import '../services/ai_service.dart';
import '../services/copy_history_service.dart';

class PromptDetailScreen extends StatefulWidget {
  const PromptDetailScreen({super.key, required this.promptId});

  final String promptId;

  bool get isNew => promptId == 'new';

  @override
  State<PromptDetailScreen> createState() => _PromptDetailScreenState();
}

class _PromptDetailScreenState extends State<PromptDetailScreen> {
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  final _tagsController = TextEditingController();
  final _aiService = AiService();
  final _copyHistory = CopyHistoryService();

  String? _categoryId;
  bool _saving = false;
  bool _aiOptimizing = false;
  bool _copied = false;
  bool _showNewCategory = false;
  final _newCategoryController = TextEditingController();

  @override
  void initState() {
    super.initState();
    if (!widget.isNew) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _loadPrompt());
    }
  }

  void _loadPrompt() {
    final provider = context.read<PromptProvider>();
    try {
      final prompt = provider.prompts.firstWhere((p) => p.id == widget.promptId);
      _applyPrompt(prompt);
    } catch (_) {
      provider.loadAll().then((_) {
        if (!mounted) return;
        try {
          final prompt =
              provider.prompts.firstWhere((p) => p.id == widget.promptId);
          _applyPrompt(prompt);
        } catch (_) {}
      });
    }
  }

  void _applyPrompt(Prompt prompt) {
    setState(() {
      _titleController.text = prompt.title;
      _contentController.text = prompt.content;
      _categoryId = prompt.categoryId;
      _tagsController.text = prompt.tags.join(', ');
    });
  }

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    _tagsController.dispose();
    _newCategoryController.dispose();
    super.dispose();
  }

  List<String> _parseTags() {
    return _tagsController.text
        .split(',')
        .map((t) => t.trim())
        .where((t) => t.isNotEmpty)
        .toList();
  }

  Future<void> _save() async {
    final title = _titleController.text.trim();
    final content = _contentController.text.trim();
    if (title.isEmpty || content.isEmpty) return;

    setState(() => _saving = true);
    final provider = context.read<PromptProvider>();
    final tags = _parseTags();
    final categoryId = _categoryId?.isEmpty == true ? null : _categoryId;

    final ok = widget.isNew
        ? await provider.createPrompt(
            title: title,
            content: content,
            categoryId: categoryId,
            tags: tags,
          )
        : await provider.updatePrompt(
            widget.promptId,
            title: title,
            content: content,
            categoryId: categoryId,
            tags: tags,
          );

    if (mounted) {
      setState(() => _saving = false);
      if (ok) context.go('/prompts');
    }
  }

  Future<void> _copy() async {
    final content = _contentController.text;
    await Clipboard.setData(ClipboardData(text: content));
    await _copyHistory.addEntry(
      CopyHistoryEntry(
        promptId: widget.promptId,
        title: _titleController.text,
        content: content,
        copiedAt: DateTime.now(),
      ),
    );
    if (!widget.isNew) {
      if (mounted) {
        await context.read<PromptProvider>().incrementUsage(widget.promptId);
      }
    }
    setState(() => _copied = true);
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _copied = false);
    });
  }

  Future<void> _aiOptimize() async {
    final content = _contentController.text.trim();
    if (content.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('请先输入 Prompt 内容')),
      );
      return;
    }

    setState(() => _aiOptimizing = true);
    final result = await _aiService.optimizePrompt(content);
    if (mounted) {
      setState(() => _aiOptimizing = false);
      if (result.error != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result.error!)),
        );
      } else if (result.optimized != null) {
        _contentController.text = result.optimized!;
      }
    }
  }

  Future<void> _createCategory() async {
    final name = _newCategoryController.text.trim();
    if (name.isEmpty) return;

    final ok = await context.read<PromptProvider>().createCategory(name: name);
    if (ok && mounted) {
      final provider = context.read<PromptProvider>();
      Category? created;
      for (final c in provider.categories) {
        if (c.name == name) {
          created = c;
          break;
        }
      }
      if (created != null) {
        setState(() {
          _categoryId = created!.id;
          _showNewCategory = false;
          _newCategoryController.clear();
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PromptProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.isNew ? '新建 Prompt' : '编辑 Prompt'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        actions: [
          TextButton.icon(
            onPressed: _aiOptimizing ? null : _aiOptimize,
            icon: _aiOptimizing
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.auto_awesome, size: 18),
            label: Text(_aiOptimizing ? '优化中…' : 'AI 优化'),
          ),
          if (!widget.isNew)
            IconButton(
              tooltip: _copied ? '已复制' : '复制',
              icon: Icon(_copied ? Icons.check : Icons.copy),
              onPressed: _copy,
            ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(
            controller: _titleController,
            decoration: const InputDecoration(
              labelText: '标题',
              hintText: '给 Prompt 起个名字',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('分类', style: Theme.of(context).textTheme.titleSmall),
              TextButton.icon(
                onPressed: () =>
                    setState(() => _showNewCategory = !_showNewCategory),
                icon: const Icon(Icons.add, size: 18),
                label: const Text('新建分类'),
              ),
            ],
          ),
          if (_showNewCategory) ...[
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _newCategoryController,
                    decoration: const InputDecoration(
                      hintText: '新分类名称',
                      border: OutlineInputBorder(),
                      isDense: true,
                    ),
                    onSubmitted: (_) => _createCategory(),
                  ),
                ),
                const SizedBox(width: 8),
                FilledButton(
                  onPressed: _createCategory,
                  child: const Text('添加'),
                ),
              ],
            ),
            const SizedBox(height: 8),
          ],
          DropdownButtonFormField<String?>(
            value: _categoryId,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
            ),
            items: [
              const DropdownMenuItem(value: null, child: Text('未分类')),
              ...provider.categories.map(
                (c) {
                  final parentName = c.parentId != null
                      ? provider.categoryName(c.parentId)
                      : null;
                  final label = parentName != null ? '$parentName / ${c.name}' : c.name;
                  return DropdownMenuItem(value: c.id, child: Text(label));
                },
              ),
            ],
            onChanged: (v) => setState(() => _categoryId = v),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _tagsController,
            decoration: const InputDecoration(
              labelText: '标签（用逗号分隔）',
              hintText: '写作, 翻译, 代码...',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Prompt 内容', style: Theme.of(context).textTheme.titleSmall),
              TextButton.icon(
                onPressed: _aiOptimizing ? null : _aiOptimize,
                icon: const Icon(Icons.auto_awesome, size: 18),
                label: Text(_aiOptimizing ? '优化中…' : 'AI 优化'),
              ),
            ],
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _contentController,
            maxLines: 14,
            decoration: const InputDecoration(
              hintText: '在这里输入你的 Prompt...',
              border: OutlineInputBorder(),
              alignLabelWithHint: true,
            ),
            style: const TextStyle(fontFamily: 'monospace', fontSize: 14),
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              OutlinedButton(
                onPressed: () => context.pop(),
                child: const Text('取消'),
              ),
              const SizedBox(width: 12),
              FilledButton.icon(
                onPressed: _saving ||
                        _titleController.text.trim().isEmpty ||
                        _contentController.text.trim().isEmpty
                    ? null
                    : _save,
                icon: _saving
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.save_outlined),
                label: Text(_saving ? '保存中...' : '保存'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
