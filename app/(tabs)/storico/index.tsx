import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useState, useMemo } from 'react';
import { useFocusEffect, router } from 'expo-router';
import { colors, fonts, spacing, radius } from '@/constants/theme';
import { getAllWorkouts, type Workout } from '@/db/workouts';
import i18n from '@/i18n';

const { width } = Dimensions.get('window');
const DAY_SIZE = (width - spacing.lg * 2 - 6 * 2) / 7; // 6 gaps of 2px each // (screen width - horizontal padding * 2) / 7 days

export default function Storico() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useFocusEffect(
    useCallback(() => {
      setWorkouts(getAllWorkouts());
    }, [])
  );

  // Group workouts by date (YYYY-MM-DD)
  const workoutsByDate = useMemo(() => {
    const map = new Map<string, Workout[]>();
    workouts.forEach(w => {
      const date = new Date(w.data);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(w);
    });
    return map;
  }, [workouts]);

  // Get days of the current month
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = (firstDay.getDay() + 6) % 7; // Monday = 0, Sunday = 6

  const days = useMemo(() => {
    const arr = [];
    // Empty cells before the first day
    for (let i = 0; i < startingDay; i++) {
      arr.push(null);
    }
    // Days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push(new Date(year, month, d));
    }
    return arr;
  }, [year, month, startingDay, daysInMonth]);

  const monthName = currentMonth.toLocaleDateString(i18n.locale, { month: 'long', year: 'numeric' });

  const changeMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const handleDayPress = (date: Date | null) => {
    if (!date) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    router.push(`/(tabs)/storico/giorno/${key}`);
  };

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{i18n.t('storico.title')}</Text>

        {/* Month selector */}
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={() => changeMonth('prev')}>
            <Text style={styles.monthNav}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthName}>{monthName}</Text>
          <TouchableOpacity onPress={() => changeMonth('next')}>
            <Text style={styles.monthNav}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Day names */}
        <View style={styles.dayNamesRow}>
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
            <Text key={day} style={styles.dayName}>{day}</Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.calendarGrid}>
          {days.map((date, idx) => (
            <DayCell
              key={idx}
              date={date}
              workouts={date ? workoutsByDate.get(
                `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
              ) ?? [] : []}
              isToday={date ? todayKey === `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : false}
              onPress={() => handleDayPress(date)}
            />
          ))}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendText}>{i18n.t('storico.dayWithWorkouts')}</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function DayCell({ date, workouts, isToday, onPress }: {
  date: Date | null;
  workouts: Workout[];
  isToday: boolean;
  onPress: () => void;
}) {
  if (!date) {
    return <View style={styles.dayCellEmpty} />;
  }

  const hasWorkouts = workouts.length > 0;
  const dayNumber = date.getDate();

  return (
    <TouchableOpacity
      style={[styles.dayCell, isToday && styles.dayCellToday]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.dayNumber, isToday && styles.dayNumberToday]}>{dayNumber}</Text>
      {hasWorkouts && (
        <View style={styles.dots}>
          {/* Show up to 3 dots for different sport types */}
          {Array.from(new Set(workouts.map(w => w.sport))).slice(0, 3).map(sport => (
            <View key={sport} style={[styles.dot, { backgroundColor: colors.primary }]} />
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: 100 },
  title: {
    fontFamily: fonts.serif,
    fontSize: 38,
    color: colors.white,
    marginBottom: spacing.lg,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  monthNav: {
    fontSize: 30,
    color: colors.gray2,
    paddingHorizontal: 20,
  },
  monthName: {
    fontFamily: fonts.sansMedium,
    fontSize: 20,
    color: colors.white,
  },
  dayNamesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
  },
  dayName: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.gray3,
    width: DAY_SIZE,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    marginBottom: spacing.lg,
  },
  dayCellEmpty: {
    width: DAY_SIZE,
    height: DAY_SIZE,
  },
  dayCell: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    backgroundColor: colors.card,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayCellToday: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  dayNumber: {
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.white,
  },
  dayNumberToday: {
    fontFamily: fonts.sansMedium,
    color: colors.white,
  },
  dots: {
    flexDirection: 'row',
    marginTop: 2,
    gap: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legend: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.gray3,
  },
});
