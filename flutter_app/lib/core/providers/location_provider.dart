import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:latlong2/latlong.dart';
import '../services/location_service.dart';

/// LocationServiceのProvider
final locationServiceProvider = Provider<LocationService>((ref) {
  return LocationService();
});

/// 現在位置の状態
class LocationState {
  final LatLng? location;
  final bool isLoading;
  final String? error;

  LocationState({
    this.location,
    this.isLoading = false,
    this.error,
  });

  LocationState copyWith({
    LatLng? location,
    bool? isLoading,
    String? error,
  }) {
    return LocationState(
      location: location ?? this.location,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// 現在位置を管理するNotifier
class LocationNotifier extends StateNotifier<LocationState> {
  final LocationService _locationService;

  LocationNotifier(this._locationService) : super(LocationState());

  /// 現在位置を取得
  Future<void> fetchCurrentLocation() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final location = await _locationService.getCurrentLocation();

      if (location != null) {
        state = LocationState(location: location, isLoading: false);
      } else {
        // 位置情報が取得できない場合はデフォルト位置を使用
        final defaultLocation = _locationService.getDefaultLocation();
        state = LocationState(
          location: defaultLocation,
          isLoading: false,
          error: '位置情報を取得できませんでした。デフォルト位置を使用しています。',
        );
      }
    } catch (e) {
      final defaultLocation = _locationService.getDefaultLocation();
      state = LocationState(
        location: defaultLocation,
        isLoading: false,
        error: 'エラーが発生しました: ${e.toString()}',
      );
    }
  }

  /// 位置を手動で設定
  void setLocation(LatLng location) {
    state = LocationState(location: location, isLoading: false);
  }

  /// デフォルト位置にリセット
  void resetToDefault() {
    final defaultLocation = _locationService.getDefaultLocation();
    state = LocationState(location: defaultLocation, isLoading: false);
  }
}

/// 現在位置のProvider
final locationProvider = StateNotifierProvider<LocationNotifier, LocationState>((ref) {
  final locationService = ref.watch(locationServiceProvider);
  return LocationNotifier(locationService);
});

/// 現在位置を取得する便利なProvider
final currentLocationProvider = Provider<LatLng?>((ref) {
  return ref.watch(locationProvider).location;
});
