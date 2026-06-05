import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../models/category.dart';
import '../providers/prompt_provider.dart';

class CategoriesScreen extends StatefulWidget {
  const CategoriesScreen({super.key});

  @override
  State<CategoriesScreen> createState() => _CategoriesScreenState();
}

class _CategoriesScreenState extends State<CategoriesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PromptProvider>().loadAll();
    });
  }

  Future<void> _showCategoryDialog({Category? category}) async {
    final nameController = TextEditingController(text: category?.name ?? '');
    String? parentId = category?.parentId;
    final provider = context.read<PromptProvider>();

    await showDialog<void>(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setDialogState) {
            final rootCategories = provider.rootCategories
                .where((c) => c.id != category?.id)
                .toList();

            return AlertDialog(
              title: Text(category == null ? '新建分类' : '编辑分类'),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: nameController,
                    decoration: const InputDecoration(
                      labelText: '分类名称',
                      border: OutlineInputBorder(),
                    ),
                    autofocus: true,
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String?>(
                    value: parentId,
                    decoration: const InputDecoration(
                      labelText: '父分类（可选，二级分类）',
                      border: OutlineInputBorder(),
                    ),
                    items: [
                      const DropdownMenuItem(
                        value: null,
                        child: Text('无（顶级分类）'),
                      ),
                      ...rootCategories.map(
                        (c) => DropdownMenuItem(value: c.id, child: Text(c.name)),
                      ),
                    ],
                    onChanged: (v) => setDialogState(() => parentId = v),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('取消'),
                ),
                FilledButton(
                  onPressed: () async {
                    final name = nameController.text.trim();
                    if (name.isEmpty) return;

                    if (category == null) {
                      await provider.createCategory(
                        name: name,
                        parentId: parentId,
                      );
                    } else {
                      await provider.updateCategory(
                        category.id,
                        name: name,
                        parentId: parentId,
                      );
                    }
                    if (ctx.mounted) Navigator.pop(ctx);
                  },
                  child: const Text('保存'),
                ),
              ],
            );
          },
        );
      },
    );
    nameController.dispose();
  }

  Future<void> _confirmDelete(Category category) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('删除分类'),
        content: Text('确定删除分类「${category.name}」吗？'),
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
      await context.read<PromptProvider>().deleteCategory(category.id);
    }
  }

  List<Category> _orderedCategories(List<Category> all) {
    final roots = all.where((c) => c.parentId == null).toList()
      ..sort((a, b) => a.sortOrder.compareTo(b.sortOrder));

    final result = <Category>[];
    for (final root in roots) {
      result.add(root);
      final children = all.where((c) => c.parentId == root.id).toList()
        ..sort((a, b) => a.sortOrder.compareTo(b.sortOrder));
      result.addAll(children);
    }
    return result;
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PromptProvider>();
    final ordered = _orderedCategories(provider.categories);

    return Scaffold(
      appBar: AppBar(
        title: const Text('分类管理'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _showCategoryDialog(),
          ),
        ],
      ),
      body: provider.loading && ordered.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : ordered.isEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text('还没有分类'),
                      const SizedBox(height: 16),
                      FilledButton.icon(
                        onPressed: () => _showCategoryDialog(),
                        icon: const Icon(Icons.add),
                        label: const Text('创建分类'),
                      ),
                    ],
                  ),
                )
              : ReorderableListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: ordered.length,
                  onReorder: (oldIndex, newIndex) async {
                    if (newIndex > oldIndex) newIndex--;
                    final mutable = List<Category>.from(ordered);
                    final item = mutable.removeAt(oldIndex);
                    mutable.insert(newIndex, item);
                    await provider.reorderCategories(mutable);
                  },
                  itemBuilder: (context, index) {
                    final category = ordered[index];
                    final isChild = category.parentId != null;
                    final parentName = isChild
                        ? provider.categoryName(category.parentId)
                        : null;

                    return Card(
                      key: ValueKey(category.id),
                      margin: EdgeInsets.only(
                        bottom: 8,
                        left: isChild ? 24 : 0,
                      ),
                      child: ListTile(
                        leading: ReorderableDragStartListener(
                          index: index,
                          child: const Icon(Icons.drag_handle),
                        ),
                        title: Text(category.name),
                        subtitle: isChild && parentName != null
                            ? Text('父分类：$parentName')
                            : null,
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.edit_outlined),
                              onPressed: () =>
                                  _showCategoryDialog(category: category),
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete_outline),
                              onPressed: () => _confirmDelete(category),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showCategoryDialog(),
        child: const Icon(Icons.add),
      ),
    );
  }
}
