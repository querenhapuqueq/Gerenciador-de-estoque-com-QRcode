import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* LOGO */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* CABEÇALHO */}
          <View style={styles.header}>
            <Text style={styles.saudacao}>Olá, Queren!</Text>
            <Text style={styles.data}>29 JULHO DE 2026</Text>
          </View>

          {/* BARRA DE PESQUISA */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={18} color="#333" />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquise QR CODE"
              placeholderTextColor="#666"
            />
            <MaterialCommunityIcons name="qrcode-scan" size={20} color="#333" />
          </View>

          {/* GRID DE CARDS/MÉTRICAS */}
          <View style={styles.cardsGrid}>
            {/* Card: Movimento do Dia */}
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="stats-chart-outline" size={32} color="#000" />
                <Text style={styles.cardTitle}>MOVIMENTO{"\n"}DO DIA</Text>
              </View>
              <Text style={[styles.cardValue, { color: '#0066ff' }]}>100</Text>
              <Text style={[styles.cardArrow, { color: '#0066ff' }]}>&gt;</Text>
            </TouchableOpacity>

            {/* Card: Entrada */}
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="package-variant-closed-plus" size={32} color="#000" />
                <Text style={styles.cardTitle}>ENTRADA</Text>
              </View>
              <Text style={[styles.cardValue, { color: '#00a884' }]}>100</Text>
              <Text style={[styles.cardArrow, { color: '#00a884' }]}>&gt;</Text>
            </TouchableOpacity>

            {/* Card: Saída */}
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="home-export-outline" size={32} color="#000" />
                <Text style={styles.cardTitle}>SAÍDA</Text>
              </View>
              <Text style={[styles.cardValue, { color: '#ff2a4b' }]}>100</Text>
              <Text style={[styles.cardArrow, { color: '#ff2a4b' }]}>&gt;</Text>
            </TouchableOpacity>

            {/* Card: Ajuste por Inventário */}
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="document-text-outline" size={32} color="#000" />
                <Text style={styles.cardTitle}>AJUSTE POR{"\n"}INVENTÁRIO</Text>
              </View>
              <Text style={[styles.cardValue, { color: '#ffb703' }]}>100</Text>
              <Text style={[styles.cardArrow, { color: '#ffb703' }]}>&gt;</Text>
            </TouchableOpacity>
          </View>

          {/* SEÇÃO DE MOVIMENTAÇÕES RECENTES */}
          <View style={styles.recentesHeader}>
            <Text style={styles.recentesTitulo}>MOVIMENTAÇÕES RECENTES</Text>
            <TouchableOpacity>
              <Text style={styles.verMais}>VER MAIS &gt;</Text>
            </TouchableOpacity>
          </View>

          {/* LISTA DE MOVIMENTAÇÕES */}
          <View style={styles.listaRecentes}>
            {/* Item 1 */}
            <View style={styles.itemRecente}>
              <View style={[styles.iconCircle, { backgroundColor: '#009688' }]}>
                <Ionicons name="chevron-down" size={20} color="#fff" />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTipo}>ENTRADA</Text>
                <Text style={styles.itemNome}>ZEUS 1 11</Text>
              </View>
              <Text style={styles.itemTempo}>+ 25 M</Text>
              <Text style={styles.itemArrow}>&gt;</Text>
            </View>

            {/* Item 2 */}
            <View style={styles.itemRecente}>
              <View style={[styles.iconCircle, { backgroundColor: '#ff1744' }]}>
                <Ionicons name="chevron-up" size={20} color="#fff" />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTipo}>SAÍDA</Text>
                <Text style={styles.itemNome}>HELIOS 2 12</Text>
              </View>
              <Text style={styles.itemTempo}>+ 50 M</Text>
              <Text style={styles.itemArrow}>&gt;</Text>
            </View>

            {/* Item 3 */}
            <View style={styles.itemRecente}>
              <View style={[styles.iconCircle, { backgroundColor: '#009688' }]}>
                <Ionicons name="chevron-down" size={20} color="#fff" />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTipo}>ENTRADA</Text>
                <Text style={styles.itemNome}>FLASH 110</Text>
              </View>
              <Text style={styles.itemTempo}>+ 1,50 M</Text>
              <Text style={styles.itemArrow}>&gt;</Text>
            </View>
          </View>
        </ScrollView>

        {/* BARRA DE NAVEGAÇÃO INFERIOR (BOTTOM BAR) */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.navButton}>
            <MaterialCommunityIcons name="qrcode-scan" size={26} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton}>
            <Ionicons name="document-text-outline" size={26} color="#000" />
          </TouchableOpacity>

          {/* Botão Home em Destaque */}
          <TouchableOpacity style={styles.navButtonHome}>
            <Ionicons name="home" size={28} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton}>
            <Ionicons name="notifications-outline" size={26} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton}>
            <Ionicons name="person" size={26} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6f8',
  },
  innerContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 90,
  },

  /* LOGO */
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 90,
    height: 50,
  },

  /* CABEÇALHO */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  saudacao: {
    fontSize: 14,
    color: '#333',
  },
  data: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
  },

  /* BARRA DE PESQUISA */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 42,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: '#333',
  },

  /* GRID CARDS */
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
    marginBottom: 25,
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    minHeight: 125,
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#222',
    flexShrink: 1,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginTop: 4,
  },
  cardArrow: {
    fontSize: 14,
    fontWeight: 'bold',
    alignSelf: 'flex-end',
  },

  /* RECENTES */
  recentesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recentesTitulo: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  verMais: {
    fontSize: 11,
    color: '#0066ff',
    fontWeight: 'bold',
  },
  listaRecentes: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  itemRecente: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTipo: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111',
  },
  itemNome: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  itemTempo: {
    fontSize: 11,
    color: '#333',
    marginRight: 8,
  },
  itemArrow: {
    fontSize: 12,
    color: '#0066ff',
  },

  /* BOTTOM BAR CORRIGIDA */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: '#008585',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 10,
  },
  navButton: {
    padding: 8,
  },
  navButtonHome: {
    backgroundColor: '#3b82f6',
    width: 58,
    height: 58,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -25,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});