import 'package:flutter/foundation.dart' hide Category;

import '../models/category.dart';
import '../models/prompt.dart';
import '../services/prompt_repository.dart';

class PromptProvider extends ChangeNotifier {
  PromptProvider({PromptRepository? repository})
      : _repository = repository ?? PromptRepository();

  final PromptRepository _repository;

  List<Prompt> _prompts = [];
  List<Category> _categories = [];
  bool _loading = false;
  String? _error;

  List<Prompt> get prompts => _prompts;
  List<Category> get categories => _categories;
  bool get loading => _loading;
  String? get error => _error;

  Future<void> loadAll() async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final results = await Future.wait([
        _repository.fetchPrompts(),
        _repository.fetchCategories(),
      ]);
      _prompts = results[0] as List<Prompt>;
      _categories = results[1] as List<Category>;
    } catch (e) {
      _error = e.toString();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> search({
    String? query,
    String? categoryId,
    List<String>? tags,
  }) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      _prompts = await _repository.searchPrompts(
        query: query,
        categoryId: categoryId,
        tags: tags,
      );
    } catch (e) {
      _error = e.toString();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<bool> createPrompt({
    required String title,
    required String content,
    String? categoryId,
    List<String> tags = const [],
  }) async {
    try {
      await _repository.createPrompt(
        title: title,
        content: content,
        categoryId: categoryId,
        tags: tags,
      );
      await loadAll();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> updatePrompt(
    String id, {
    required String title,
    required String content,
    String? categoryId,
    List<String> tags = const [],
  }) async {
    try {
      await _repository.updatePrompt(
        id,
        title: title,
        content: content,
        categoryId: categoryId,
        tags: tags,
      );
      await loadAll();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> deletePrompt(String id) async {
    try {
      await _repository.deletePrompt(id);
      await loadAll();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> deletePrompts(List<String> ids) async {
    try {
      await _repository.deletePrompts(ids);
      await loadAll();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<void> incrementUsage(String id) async {
    final prompt = _prompts.firstWhere((p) => p.id == id);
    await _repository.incrementUsageCount(id, prompt.usageCount);
    await loadAll();
  }

  Future<bool> createCategory({
    required String name,
    String? parentId,
  }) async {
    try {
      await _repository.createCategory(
        name: name,
        parentId: parentId,
        sortOrder: _categories.length,
      );
      await loadAll();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateCategory(
    String id, {
    required String name,
    String? parentId,
    int? sortOrder,
  }) async {
    try {
      await _repository.updateCategory(
        id,
        name: name,
        parentId: parentId,
        sortOrder: sortOrder,
      );
      await loadAll();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteCategory(String id) async {
    try {
      await _repository.deleteCategory(id);
      await loadAll();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> reorderCategories(List<Category> ordered) async {
    try {
      await _repository.reorderCategories(ordered);
      await loadAll();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  String? categoryName(String? categoryId) {
    if (categoryId == null) return null;
    try {
      return _categories.firstWhere((c) => c.id == categoryId).name;
    } catch (_) {
      return null;
    }
  }

  List<Category> get rootCategories =>
      _categories.where((c) => c.parentId == null).toList();

  List<Category> childCategories(String parentId) =>
      _categories.where((c) => c.parentId == parentId).toList();

  void clear() {
    _prompts = [];
    _categories = [];
    _error = null;
    notifyListeners();
  }
}
