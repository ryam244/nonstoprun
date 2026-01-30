import 'package:flutter_riverpod/flutter_riverpod.dart';

/// 距離の状態を管理するProvider
class DistanceNotifier extends StateNotifier<double> {
  DistanceNotifier() : super(5.0); // デフォルト5.0km

  void setDistance(double distance) {
    if (distance >= 1.0 && distance <= 42.0) {
      state = distance;
    }
  }

  void increment() {
    if (state < 42.0) {
      state += 0.5;
    }
  }

  void decrement() {
    if (state > 1.0) {
      state -= 0.5;
    }
  }
}

final distanceProvider = StateNotifierProvider<DistanceNotifier, double>((ref) {
  return DistanceNotifier();
});
