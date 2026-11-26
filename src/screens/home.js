import React, { useState, useCallback, useEffect } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import {
  listarMovimentacoesRecentes,
  obterResumoDashboard
} from '../database/database';

function obterDataAtualFormatada() {
  const meses = [
    'JANEIRO',
    'FEVEREIRO',
    'MARÇO',
    'ABRIL',
    'MAIO',
    'JUNHO',
    'JULHO',
    'AGOSTO',
    'SETEMBRO',
    'OUTUBRO',
    'NOVEMBRO',
    'DEZEMBRO'
  ];

  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, '0');
  const mes = meses[hoje.getMonth()];
  const ano = hoje.getFullYear();

  return `${dia} ${mes} DE ${ano}`;
}

export default function HomeScreen({ navigation, route }) {
  const [nomeUsuario, setNomeUsuario] = useState('Usuário');
  const [dataHoje, setDataHoje] = useState(obterDataAtualFormatada());
  const [recentes, setRecentes] = useState([]);
  const [resumo, setResumo] = useState({
    movimentoDia: 0,
    entradas: 0,
    saidas: 0,
    ajustes: 0
  });

  useEffect(() => {
    const nomeCompleto = route?.params?.usuario?.nome;
    if (nomeCompleto && nomeCompleto.trim() !== '') {
      const primeiroNome = nomeCompleto.trim().split(' ')[0];
      const nomeFormatado =
        primeiroNome.charAt(0).toUpperCase() + primeiroNome.slice(1);
      setNomeUsuario(nomeFormatado);
    } else {
      setNomeUsuario('Usuário');
    }
  }, [route?.params?.usuario]);

  useFocusEffect(
    useCallback(() => {
      setDataHoje(obterDataAtualFormatada());

      async function carregarDashboard() {
        try {
          const [ultimas, totais] = await Promise.all([
            listarMovimentacoesRecentes(5),
            obterResumoDashboard()
          ]);
          setRecentes(ultimas);
          setResumo(totais);
        } catch (error) {
          console.error('Erro ao carregar dashboard:', error);
        }
      }
      carregarDashboard();
    }, [])
  );

  const obterEstiloMovimentacao = (tipo) => {
    switch (tipo) {
      case 'saida':
        return { cor: '#ff1744', icone: 'chevron-up', sinal: '-' };
      case 'ajuste do dia':
        return { cor: '#ffb703', icone: 'sync', sinal: '' };
      case 'reservado':
        return { cor: '#3b82f6', icone: 'bookmark', sinal: '' };
      case 'entrada':
      default:
        return { cor: '#009688', icone: 'chevron-down', sinal: '+' };
    }
  };

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
            <Text style={styles.saudacao}>Olá, {nomeUsuario}!</Text>
            <Text style={styles.data}>{dataHoje}</Text>
          </View>

          {/* BARRA DE PESQUISA */}
          <TouchableOpacity
            style={styles.searchContainer}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ListaTecidos')}
          >
            <Ionicons name="search-outline" size={18} color="#333" />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquise tecido ou QR CODE"
              placeholderTextColor="#666"
              editable={false}
              pointerEvents="none"
            />
            <MaterialCommunityIcons name="qrcode-scan" size={20} color="#333" />
          </TouchableOpacity>

          {/* GRID DE CARDS/MÉTRICAS COM FUNÇÕES ESPECÍFICAS */}
          <View style={styles.cardsGrid}>
            {/* Card 1: Movimento do Dia -> Mostra só movimentos de hoje */}
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate('HistoricoMovimentacoes', {
                  filtro: 'hoje',
                  titulo: 'MOVIMENTO DO DIA'
                })
              }
            >
              <View style={styles.cardHeader}>
                <Ionicons name="stats-chart-outline" size={32} color="#000" />
                <Text style={styles.cardTitle}>MOVIMENTO{"\n"}DO DIA</Text>
              </View>
              <Text style={[styles.cardValue, { color: '#0066ff' }]}>
                {resumo.movimentoDia}
              </Text>
              <Text style={[styles.cardArrow, { color: '#0066ff' }]}>&gt;</Text>
            </TouchableOpacity>

            {/* Card 2: Entrada -> Mostra só as ENTRADAS */}
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate('HistoricoMovimentacoes', {
                  filtro: 'entrada',
                  titulo: 'HISTÓRICO DE ENTRADAS'
                })
              }
            >
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="package-variant-closed-plus" size={32} color="#000" />
                <Text style={styles.cardTitle}>ENTRADA</Text>
              </View>
              <Text style={[styles.cardValue, { color: '#00a884' }]}>
                {resumo.entradas}
              </Text>
              <Text style={[styles.cardArrow, { color: '#00a884' }]}>&gt;</Text>
            </TouchableOpacity>

            {/* Card 3: Saída -> Mostra só as SAÍDAS */}
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate('HistoricoMovimentacoes', {
                  filtro: 'saida',
                  titulo: 'HISTÓRICO DE SAÍDAS'
                })
              }
            >
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="home-export-outline" size={32} color="#000" />
                <Text style={styles.cardTitle}>SAÍDA</Text>
              </View>
              <Text style={[styles.cardValue, { color: '#ff2a4b' }]}>
                {resumo.saidas}
              </Text>
              <Text style={[styles.cardArrow, { color: '#ff2a4b' }]}>&gt;</Text>
            </TouchableOpacity>

            {/* Card 4: Ajuste por Inventário -> Mostra só os AJUSTES */}
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate('HistoricoMovimentacoes', {
                  filtro: 'ajuste do dia',
                  titulo: 'AJUSTE POR INVENTÁRIO'
                })
              }
            >
              <View style={styles.cardHeader}>
                <Ionicons name="document-text-outline" size={32} color="#000" />
                <Text style={styles.cardTitle}>AJUSTE POR{"\n"}INVENTÁRIO</Text>
              </View>
              <Text style={[styles.cardValue, { color: '#ffb703' }]}>
                {resumo.ajustes}
              </Text>
              <Text style={[styles.cardArrow, { color: '#ffb703' }]}>&gt;</Text>
            </TouchableOpacity>
          </View>

          {/* SEÇÃO DE MOVIMENTAÇÕES RECENTES */}
          <View style={styles.recentesHeader}>
            <Text style={styles.recentesTitulo}>MOVIMENTAÇÕES RECENTES</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('HistoricoMovimentacoes', {
                  filtro: 'todos',
                  titulo: 'TODAS AS MOVIMENTAÇÕES'
                })
              }
            >
              <Text style={styles.verMais}>VER MAIS &gt;</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.listaRecentes}>
            {recentes.length === 0 ? (
              <View style={styles.vazioBox}>
                <Text style={styles.vazioTexto}>
                  Nenhuma atualização recente registrada.
                </Text>
              </View>
            ) : (
              recentes.map((item, index) => {
                const estilo = obterEstiloMovimentacao(item.tipo);
                const ultimoItem = index === recentes.length - 1;
                const unidadeAbrev =
                  item.produto_unidade === 'metros'
                    ? 'M'
                    : item.produto_unidade.toUpperCase();

                const tituloProduto = item.produto_cor
                  ? `${item.produto_nome} (${item.produto_cor})`
                  : item.produto_nome;

                return (
                  <TouchableOpacity
                    key={String(item.id)}
                    style={[
                      styles.itemRecente,
                      ultimoItem && { borderBottomWidth: 0 }
                    ]}
                    onPress={() =>
                      navigation.navigate('HistoricoMovimentacoes', {
                        filtro: item.tipo,
                        titulo: item.tipo.toUpperCase()
                      })
                    }
                  >
                    <View style={[styles.iconCircle, { backgroundColor: estilo.cor }]}>
                      <Ionicons name={estilo.icone} size={20} color="#fff" />
                    </View>

                    <View style={styles.itemInfo}>
                      <Text style={styles.itemTipo}>
                        {item.tipo.toUpperCase()}
                        {item.data_formatada ? ` • ${item.data_formatada}` : ''}
                      </Text>
                      <Text style={styles.itemNome} numberOfLines={1}>
                        {tituloProduto.toUpperCase()}
                      </Text>
                      {item.observacao ? (
                        <Text style={styles.itemObs} numberOfLines={1}>
                          {item.observacao}
                        </Text>
                      ) : null}
                    </View>

                    <Text style={[styles.itemTempo, { color: estilo.cor }]}>
                      {estilo.sinal} {String(item.quantidade).replace('.', ',')} {unidadeAbrev}
                    </Text>
                    <Text style={styles.itemArrow}>&gt;</Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>

        {/* BARRA DE NAVEGAÇÃO INFERIOR */}
        <View style={styles.bottomBar}>
          {/* 1º botão: Câmera Leitor de QR Code */}
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('LeitorQrCode')}
          >
            <MaterialCommunityIcons name="qrcode-scan" size={26} color="#000" />
          </TouchableOpacity>

          {/* 2º botão: Estoque de Tecidos (Entradas, Saídas e Ver QR) */}
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('ListaTecidos')}
          >
            <Ionicons name="document-text-outline" size={26} color="#000" />
          </TouchableOpacity>

          {/* Home */}
          <TouchableOpacity style={styles.navButtonHome}>
            <Ionicons name="home" size={28} color="#000" />
          </TouchableOpacity>

          {/* Cadastrar Novo Tecido */}
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('CadastroTecido')}>
            <Ionicons name="add-circle-outline" size={28} color="#000" />
          </TouchableOpacity>

           {/* Ícone de Perfil -> Abre tela com dados do usuário e botão Sair */}
          <TouchableOpacity
            style={styles.navButton}
            onPress={() =>
              navigation.navigate('Perfil', {
                usuario: route?.params?.usuario
              })
            }
          >
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 90,
    height: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  saudacao: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  data: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
  },
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
  vazioBox: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  vazioTexto: {
    fontSize: 12,
    color: '#888',
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
  itemObs: {
    fontSize: 9,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 2,
  },
  itemTempo: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  itemArrow: {
    fontSize: 12,
    color: '#0066ff',
  },
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