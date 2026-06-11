import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadows, spacing } from '../theme/theme';

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

  const closeMenu = () => setMenuOpen(false);

  const handleAction = (action) => {
    closeMenu();
    action?.();
  };

  return (
    <View style={styles.header}>
      <Text style={styles.appName}>Budget Car</Text>

      <Pressable
        onPress={() => setMenuOpen((open) => !open)}
        style={styles.menuButton}
        accessibilityRole="button"
        accessibilityLabel="Abrir menu"
      >
        <Text style={styles.menuIcon}>☰</Text>
      </Pressable>

      {menuOpen ? (
        <Modal visible transparent animationType="fade" onRequestClose={closeMenu}>
          <Pressable style={styles.backdrop} onPress={closeMenu}>
            <View style={styles.dropdownAnchor}>
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
    height: 64,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    position: 'relative',
    zIndex: 10,
  },
  appName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  menuButton: {
    position: 'absolute',
    right: spacing.md,
    width: 42,
    height: 38,
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
    top: 58,
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
