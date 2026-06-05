import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/category.dart';
import '../models/prompt.dart';

class PromptRepository {
  SupabaseClient get _client => Supabase.instance.client;

  String? get _userId => _client.auth.currentUser?.id;

  Future<List<Prompt>> fetchPrompts() async {
    final userId = _userId;
    if (userId == null) return [];

    final data = await _client
        .from('prompts')
        .select()
        .eq('user_id', userId)
        .order('created_at', ascending: false);

    return (data as List<dynamic>)
        .map((e) => Prompt.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<Prompt>> searchPrompts({
    String? query,
    String? categoryId,
    List<String>? tags,
  }) async {
    final userId = _userId;
    if (userId == null) return [];

    var builder = _client.from('prompts').select().eq('user_id', userId);

    if (query != null && query.isNotEmpty) {
      builder = builder.or('title.ilike.%$query%,content.ilike.%$query%');
    }
    if (categoryId != null && categoryId.isNotEmpty) {
      builder = builder.eq('category_id', categoryId);
    }
    if (tags != null && tags.isNotEmpty) {
      builder = builder.overlaps('tags', tags);
    }

    final data = await builder.order('created_at', ascending: false);
    return (data as List<dynamic>)
        .map((e) => Prompt.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> createPrompt({
    required String title,
    required String content,
    String? categoryId,
    List<String> tags = const [],
  }) async {
    final userId = _userId;
    if (userId == null) throw Exception('未登录');

    await _client.from('prompts').insert({
      'user_id': userId,
      'title': title,
      'content': content,
      'category_id': categoryId,
      'tags': tags,
      'variables': [],
    });
  }

  Future<void> updatePrompt(
    String id, {
    required String title,
    required String content,
    String? categoryId,
    List<String> tags = const [],
  }) async {
    await _client.from('prompts').update({
      'title': title,
      'content': content,
      'category_id': categoryId,
      'tags': tags,
      'updated_at': DateTime.now().toUtc().toIso8601String(),
    }).eq('id', id);
  }

  Future<void> deletePrompt(String id) async {
    await _client.from('prompts').delete().eq('id', id);
  }

  Future<void> deletePrompts(List<String> ids) async {
    for (final id in ids) {
      await deletePrompt(id);
    }
  }

  Future<void> incrementUsageCount(String id, int currentCount) async {
    await _client
        .from('prompts')
        .update({'usage_count': currentCount + 1}).eq('id', id);
  }

  Future<List<Category>> fetchCategories() async {
    final userId = _userId;
    if (userId == null) return [];

    final data = await _client
        .from('categories')
        .select()
        .eq('user_id', userId)
        .order('sort_order', ascending: true);

    return (data as List<dynamic>)
        .map((e) => Category.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> createCategory({
    required String name,
    String? parentId,
    int sortOrder = 0,
  }) async {
    final userId = _userId;
    if (userId == null) throw Exception('未登录');

    await _client.from('categories').insert({
      'user_id': userId,
      'name': name,
      'parent_id': parentId,
      'sort_order': sortOrder,
    });
  }

  Future<void> updateCategory(
    String id, {
    required String name,
    String? parentId,
    int? sortOrder,
  }) async {
    final updates = <String, dynamic>{
      'name': name,
      'parent_id': parentId,
    };
    if (sortOrder != null) updates['sort_order'] = sortOrder;
    await _client.from('categories').update(updates).eq('id', id);
  }

  Future<void> deleteCategory(String id) async {
    await _client.from('categories').delete().eq('id', id);
  }

  Future<void> reorderCategories(List<Category> ordered) async {
    for (var i = 0; i < ordered.length; i++) {
      await _client
          .from('categories')
          .update({'sort_order': i})
          .eq('id', ordered[i].id);
    }
  }
}
