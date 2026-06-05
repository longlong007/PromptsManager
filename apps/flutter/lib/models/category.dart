class Category {
  final String id;
  final String userId;
  final String name;
  final String? parentId;
  final int sortOrder;
  final DateTime createdAt;

  const Category({
    required this.id,
    required this.userId,
    required this.name,
    this.parentId,
    required this.sortOrder,
    required this.createdAt,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      name: json['name'] as String,
      parentId: json['parent_id'] as String?,
      sortOrder: json['sort_order'] as int? ?? 0,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
        'name': name,
        'parent_id': parentId,
        'sort_order': sortOrder,
      };

  Category copyWith({
    String? name,
    String? parentId,
    int? sortOrder,
  }) {
    return Category(
      id: id,
      userId: userId,
      name: name ?? this.name,
      parentId: parentId ?? this.parentId,
      sortOrder: sortOrder ?? this.sortOrder,
      createdAt: createdAt,
    );
  }
}
