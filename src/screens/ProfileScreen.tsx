import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useStore } from '../store/useStore';

export default function ProfileScreen() {
  const user = useStore((s) => s.user);
  const login = useStore((s) => s.login);
  const logout = useStore((s) => s.logout);
  const [name, setName] = useState('');

  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Xin chào, {user} 👋</Text>
        <Pressable style={[styles.btn, { backgroundColor: '#dc2626' }]} onPress={logout}>
          <Text style={styles.btnText}>Đăng xuất</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>
      <TextInput style={styles.input} placeholder="Tên / MSSV" value={name} onChangeText={setName} />
      <Pressable style={[styles.btn, !name.trim() && { opacity: 0.4 }]} disabled={!name.trim()} onPress={() => login(name)}>
        <Text style={styles.btnText}>Đăng nhập</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 14, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12 },
  btn: { backgroundColor: '#2563eb', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
});
