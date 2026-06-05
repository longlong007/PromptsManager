import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AuthProvider extends ChangeNotifier {
  AuthProvider() {
    _session = Supabase.instance.client.auth.currentSession;
    Supabase.instance.client.auth.onAuthStateChange.listen((data) {
      _session = data.session;
      notifyListeners();
    });
  }

  Session? _session;
  bool _loading = false;
  String? _error;

  Session? get session => _session;
  User? get user => _session?.user;
  bool get isAuthenticated => _session != null;
  bool get loading => _loading;
  String? get error => _error;

  Future<bool> signIn(String email, String password) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await Supabase.instance.client.auth.signInWithPassword(
        email: email,
        password: password,
      );
      _session = response.session;
      return true;
    } on AuthException catch (e) {
      _error = e.message;
      return false;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<({bool success, String? message})> signUp(
    String email,
    String password,
  ) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      await Supabase.instance.client.auth.signUp(
        email: email,
        password: password,
      );
      return (success: true, message: '注册成功，请查收验证邮件');
    } on AuthException catch (e) {
      _error = e.message;
      return (success: false, message: e.message);
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> signOut() async {
    await Supabase.instance.client.auth.signOut();
    _session = null;
    notifyListeners();
  }
}
