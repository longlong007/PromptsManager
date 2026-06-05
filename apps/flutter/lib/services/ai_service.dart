import 'package:supabase_flutter/supabase_flutter.dart';

class AiService {
  Future<({String? optimized, String? error})> optimizePrompt(
    String content, {
    String? instruction,
  }) async {
    final client = Supabase.instance.client;

    if (client.auth.currentSession == null) {
      return (optimized: null, error: '请先登录');
    }

    try {
      final response = await client.functions.invoke(
        'optimize-prompt',
        body: {
          'content': content,
          if (instruction != null && instruction.trim().isNotEmpty)
            'instruction': instruction.trim(),
        },
      );

      final data = response.data;
      if (data is Map<String, dynamic>) {
        if (data.containsKey('error')) {
          return (optimized: null, error: data['error']?.toString() ?? '优化失败');
        }
        return (optimized: data['optimized'] as String?, error: null);
      }

      return (optimized: null, error: '优化失败');
    } on FunctionException catch (e) {
      final details = e.details;
      if (details is Map && details['error'] != null) {
        return (optimized: null, error: details['error'].toString());
      }
      return (optimized: null, error: e.reasonPhrase ?? '优化失败');
    } catch (_) {
      return (optimized: null, error: '网络错误，请稍后重试');
    }
  }
}
