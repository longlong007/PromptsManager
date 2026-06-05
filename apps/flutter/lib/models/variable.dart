class Variable {
  final String name;
  final String description;
  final String? defaultValue;

  const Variable({
    required this.name,
    required this.description,
    this.defaultValue,
  });

  factory Variable.fromJson(Map<String, dynamic> json) {
    return Variable(
      name: json['name'] as String? ?? '',
      description: json['description'] as String? ?? '',
      defaultValue: json['default_value'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'name': name,
        'description': description,
        if (defaultValue != null) 'default_value': defaultValue,
      };
}
