import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

class CopyHistoryEntry {
  final String promptId;
  final String title;
  final String content;
  final DateTime copiedAt;

  const CopyHistoryEntry({
    required this.promptId,
    required this.title,
    required this.content,
    required this.copiedAt,
  });

  Map<String, dynamic> toJson() => {
        'prompt_id': promptId,
        'title': title,
        'content': content,
        'copied_at': copiedAt.toIso8601String(),
      };

  factory CopyHistoryEntry.fromJson(Map<String, dynamic> json) {
    return CopyHistoryEntry(
      promptId: json['prompt_id'] as String,
      title: json['title'] as String,
      content: json['content'] as String,
      copiedAt: DateTime.parse(json['copied_at'] as String),
    );
  }
}

class CopyHistoryService {
  static const _key = 'copy_history';
  static const _maxEntries = 50;

  Future<List<CopyHistoryEntry>> getHistory() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    if (raw == null) return [];

    final list = jsonDecode(raw) as List<dynamic>;
    return list
        .map((e) => CopyHistoryEntry.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> addEntry(CopyHistoryEntry entry) async {
    final history = await getHistory();
    history.insert(0, entry);
    if (history.length > _maxEntries) {
      history.removeRange(_maxEntries, history.length);
    }

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _key,
      jsonEncode(history.map((e) => e.toJson()).toList()),
    );
  }

  Future<void> clearHistory() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_key);
  }
}
