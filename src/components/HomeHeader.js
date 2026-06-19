import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadows, spacing } from '../theme/theme';

const HEADER_BAR_HEIGHT = 56;

const MENU_ITEMS = [
  { id: 'explore', label: 'Explorar vehiculos' },
  { id: 'reservations', label: 'Mis reservas' },
];

export function HomeHeader({
  isLoggedIn,
  onExplore,
  onMyReservations,
  onLogin,
  onLogout,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const closeMenu = () => setMenuOpen(false);

  const handleAction = (action) => {
    closeMenu();
    action?.();
  };

  const dropdownTop = insets.top + HEADER_BAR_HEIGHT + spacing.xs;

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <View style={styles.headerBar}>
        <View style={styles.headerSide} />
        <Text style={styles.appName}>Budget Car</Text>
        <View style={styles.headerSide}>
          <Pressable
            onPress={() => setMenuOpen((open) => !open)}
            style={styles.menuButton}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Abrir menu"
          >
            <Text style={styles.menuIcon}>☰</Text>
          </Pressable>
        </View>
      </View>

      {menuOpen ? (
        <Modal visible transparent animationType="fade" onRequestClose={closeMenu}>
          <Pressable style={styles.backdrop} onPress={closeMenu}>
            <View style={[styles.dropdownAnchor, { top: dropdownTop }]}>
              <Pressable style={styles.dropdownMenu} onPress={(event) => event.stopPropagation()}>
                {MENU_ITEMS.map((item) => (
                  <Pressable
                    key={item.id}
                    style={styles.menuItem}
                    onPress={() =>
                      handleAction(item.id === 'explore' ? onExplore : onMyReservations)
                    }
                  >
                    <Text style={styles.menuItemText}>{item.label}</Text>
                  </Pressable>
                ))}

                <View style={styles.menuDivider} />

                {isLoggedIn ? (
                  <Pressable style={styles.menuItem} onPress={() => handleAction(onLogout)}>
                    <Text style={[styles.menuItemText, styles.menuItemDanger]}>Cerrar sesion</Text>
                  </Pressable>
                ) : (
                  <Pressable style={styles.menuItem} onPress={() => handleAction(onLogin)}>
                    <Text style={styles.menuItemText}>Iniciar sesion</Text>
                  </Pressable>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.navy,
    zIndex: 10,
  },
  headerBar: {
    height: HEADER_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  headerSide: {
    width: 48,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  appName: {
    flex: 1,
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    color: '#fff',
    fontSize: 22,
    lineHeight: 24,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.18)',
  },
  dropdownAnchor: {
    position: 'absolute',
    right: spacing.md,
    alignItems: 'flex-end',
  },
  dropdownMenu: {
    width: 210,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.xs,
    ...shadows.card,
  },
  menuItem: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  menuItemText: {
    color: colors.navy,
    fontSize: 15,
    fontWeight: '600',
  },
  menuItemDanger: {
    color: colors.red,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 4,
    marginHorizontal: 8,
  },
});
