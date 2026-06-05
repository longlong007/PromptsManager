import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../providers/prompt_provider.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PromptProvider>().loadAll();
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final promptProvider = context.watch<PromptProvider>();
    final prompts = promptProvider.prompts;
    final categories = promptProvider.categories;
    final recent = prompts.take(5).toList();
    final totalUsage =
        prompts.fold<int>(0, (sum, p) => sum + p.usageCount);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Prompt Manager'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: Center(
              child: Text(
                auth.user?.email ?? '',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
          ),
          IconButton(
            tooltip: '分类管理',
            icon: const Icon(Icons.folder_outlined),
            onPressed: () => context.push('/categories'),
          ),
          IconButton(
            tooltip: '退出',
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await auth.signOut();
              promptProvider.clear();
              if (context.mounted) context.go('/login');
            },
          ),
        ],
      ),
      body: promptProvider.loading && prompts.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: promptProvider.loadAll,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Text(
                    'AI 提示词模板',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      _StatCard(
                        label: 'Prompt 总数',
                        value: '${prompts.length}',
                        icon: Icons.description_outlined,
                      ),
                      const SizedBox(width: 12),
                      _StatCard(
                        label: '分类总数',
                        value: '${categories.length}',
                        icon: Icons.folder_outlined,
                      ),
                      const SizedBox(width: 12),
                      _StatCard(
                        label: '总使用次数',
                        value: '$totalUsage',
                        icon: Icons.trending_up,
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '最近添加',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                      ),
                      TextButton(
                        onPressed: () => context.push('/prompts'),
                        child: const Text('查看全部'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  if (recent.isEmpty)
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Center(
                          child: Text(
                            '还没有 Prompt，点击下方按钮创建',
                            style: TextStyle(
                              color: Theme.of(context)
                                  .colorScheme
                                  .onSurfaceVariant,
                            ),
                          ),
                        ),
                      ),
                    )
                  else
                    ...recent.map(
                      (p) => Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          title: Text(p.title),
                          subtitle: Text(
                            p.content,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          onTap: () => context.push('/prompts/${p.id}'),
                        ),
                      ),
                    ),
                  const SizedBox(height: 16),
                  FilledButton.icon(
                    onPressed: () => context.push('/prompts/new'),
                    icon: const Icon(Icons.add),
                    label: const Text('创建新 Prompt'),
                  ),
                  const SizedBox(height: 8),
                  OutlinedButton.icon(
                    onPressed: () => context.push('/prompts'),
                    icon: const Icon(Icons.list),
                    label: const Text('浏览全部 Prompt'),
                  ),
                ],
              ),
            ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
  });

  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, size: 20, color: Theme.of(context).colorScheme.primary),
              const SizedBox(height: 8),
              Text(
                label,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
              ),
              Text(
                value,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
