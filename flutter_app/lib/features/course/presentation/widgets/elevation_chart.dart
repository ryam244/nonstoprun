import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../../core/theme/app_colors.dart';

/// 高低差グラフウィジェット
class ElevationChart extends StatelessWidget {
  final List<double> elevations;
  final double height;

  const ElevationChart({
    super.key,
    required this.elevations,
    this.height = 120,
  });

  @override
  Widget build(BuildContext context) {
    if (elevations.isEmpty) {
      return _buildPlaceholder();
    }

    final spots = _createSpots();
    final (minY, maxY) = _getYRange();

    return SizedBox(
      height: height,
      child: LineChart(
        LineChartData(
          gridData: FlGridData(
            show: true,
            drawVerticalLine: false,
            horizontalInterval: (maxY - minY) / 4,
            getDrawingHorizontalLine: (value) => FlLine(
              color: Colors.grey.withValues(alpha: 0.2),
              strokeWidth: 1,
            ),
          ),
          titlesData: FlTitlesData(
            show: true,
            rightTitles: const AxisTitles(
              sideTitles: SideTitles(showTitles: false),
            ),
            topTitles: const AxisTitles(
              sideTitles: SideTitles(showTitles: false),
            ),
            bottomTitles: const AxisTitles(
              sideTitles: SideTitles(showTitles: false),
            ),
            leftTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                interval: (maxY - minY) / 2,
                getTitlesWidget: (value, meta) {
                  return Text(
                    '${value.toInt()}m',
                    style: const TextStyle(
                      color: Colors.grey,
                      fontSize: 10,
                    ),
                  );
                },
                reservedSize: 40,
              ),
            ),
          ),
          borderData: FlBorderData(show: false),
          minX: 0,
          maxX: (elevations.length - 1).toDouble(),
          minY: minY,
          maxY: maxY,
          lineBarsData: [
            LineChartBarData(
              spots: spots,
              isCurved: true,
              color: AppColors.primary,
              barWidth: 2,
              isStrokeCapRound: true,
              dotData: const FlDotData(show: false),
              belowBarData: BarAreaData(
                show: true,
                color: AppColors.primary.withValues(alpha: 0.1),
              ),
            ),
          ],
          lineTouchData: LineTouchData(
            touchTooltipData: LineTouchTooltipData(
              getTooltipItems: (List<LineBarSpot> touchedBarSpots) {
                return touchedBarSpots.map((barSpot) {
                  return LineTooltipItem(
                    '${barSpot.y.toInt()}m',
                    const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  );
                }).toList();
              },
            ),
          ),
        ),
      ),
    );
  }

  /// FlSpotのリストを作成
  List<FlSpot> _createSpots() {
    return elevations
        .asMap()
        .entries
        .map((entry) => FlSpot(entry.key.toDouble(), entry.value))
        .toList();
  }

  /// Y軸の範囲を取得
  (double, double) _getYRange() {
    if (elevations.isEmpty) return (0, 100);

    double minY = elevations.reduce((a, b) => a < b ? a : b);
    double maxY = elevations.reduce((a, b) => a > b ? a : b);

    // グラフの見やすさのために余白を追加
    final range = maxY - minY;
    final padding = range * 0.1;

    return (minY - padding, maxY + padding);
  }

  /// プレースホルダー
  Widget _buildPlaceholder() {
    return Container(
      height: height,
      decoration: BoxDecoration(
        color: Colors.grey.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Center(
        child: Text(
          '標高データなし',
          style: TextStyle(
            color: Colors.grey,
            fontSize: 12,
          ),
        ),
      ),
    );
  }
}
