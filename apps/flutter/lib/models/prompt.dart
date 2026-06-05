import 'variable.dart';

class Prompt {
  final String id;
  final String userId;
  final String title;
  final String content;
  final String? categoryId;
  final List<String> tags;
  final List<Variable> variables;
  final int usageCount;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Prompt({
    required this.id,
    required this.userId,
    required this.title,
    required this.content,
    this.categoryId,
    required this.tags,
    required this.variables,
    required this.usageCount,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Prompt.fromJson(Map<String, dynamic> json) {
    final rawVariables = json['variables'];
    final variables = <Variable>[];
    if (rawVariables is List) {
      for (final item in rawVariables) {
        if (item is Map<String, dynamic>) {
          variables.add(Variable.fromJson(item));
        }
      }
    }

    return Prompt(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      title: json['title'] as String,
      content: json['content'] as String,
      categoryId: json['category_id'] as String?,
      tags: (json['tags'] as List<dynamic>? ?? [])
          .map((e) => e.toString())
          .toList(),
      variables: variables,
      usageCount: json['usage_count'] as int? ?? 0,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toInsertJson() => {
        'title': title,
        'content': content,
        'category_id': categoryId,
        'tags': tags,
        'variables': variables.map((v) => v.toJson()).toList(),
      };
}
