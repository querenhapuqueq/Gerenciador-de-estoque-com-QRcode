import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { listarMovimentacoesPorFiltro } from '../database/database';

export default function HistoricoMovimentacoesScreen({ navigation, route }) {
  const filtroInicial = route?.params?.filtro || 'todos';
  const tituloInicial = route?.params?.titulo || 'MOVIMENTAÇÕES';

  const [filtroAtivo, setFiltroAtivo] = useState(filtroInicial);
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const abas = [
    { chave: 'hoje', label: 'HOJE' },
    { chave: 'entrada', label: 'ENTRADAS' },
    { chave: 'saida', label: 'SAÍDAS' },
    { chave: 'ajuste do dia', label: 'AJUSTES' },
    { chave: 'todos', label: 'TODOS' }
  ];

  const carregarDados = async (filtroSelecionado) => {
    setCarregando(true);
    try {
      const dados = await listarMovimentacoesPorFiltro(filtroSelecionado);
      setLista(dados);
    } catch (error) {
      console.error('Erro ao buscar movimentações filtradas:', error);
    } finally {
      setCarregando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const novoFiltro = route?.params?.filtro || 'todos';
      setFiltroAtivo(novoFiltro);
      carregarDados(novoFiltro);
    }, [route?.params?.filtro])
  );

  const trocarAba = (novaChave) => {
    setFiltroAtivo(novaChave);
    carregarDados(novaChave);
  };

  const obterTituloCabecalho = () => {
    switch (filtroAtivo) {
      case 'entrada':
        return 'HISTÓRICO DE ENTRADAS';
      case 'saida':
        return 'HISTÓRICO DE SAÍDAS';
      case 'hoje':
        return 'MOVIMENTO DO DIA';
      case 'ajuste do dia':
        return 'AJUSTE POR INVENTÁRIO';
      default:
        return tituloInicial;
    }
  };

  const obterEstilo = (tipo) => {
    switch (tipo) {
      case 'saida':
        return { cor: '#ff1744', icone: 'chevron-up', sinal: '-' };
      case 'ajuste do dia':
        return { cor: '#f59e0b', icone: 'sync', sinal: '' };
      case 'entrada':
      default:
        return { cor: '#009688', icone: 'chevron-down', sinal: '+' };
    }
  };

  const renderItem = ({ item }) => {
    const estilo = obterEstilo(item.tipo);
    const unidadeAbrev =
      item.produto_unidade === 'metros'
        ? 'M'
        : item.produto_unidade.toUpperCase();

    const nomeCompleto = item.produto_cor
      ? `${item.produto_nome} (${item.produto_cor})`
      : item.produto_nome;

    return (
      <View style={styles.card}>
        <View style={[styles.iconCircle, { backgroundColor: estilo.cor }]}>
          <Ionicons name={estilo.icone} size={20} color="#fff" />
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.cardTipo}>
            {item.tipo.toUpperCase()} • {item.data_formatada}
          </Text>
          <Text style={styles.cardNome}>{nomeCompleto.toUpperCase()}</Text>
          {item.observacao ? (
            <Text style={styles.cardObs}>{item.observacao}</Text>
          ) : null}
        </View>

        <Text style={[styles.cardQtd, { color: estilo.cor }]}>
          {estilo.sinal} {String(item.quantidade).replace('.', ',')} {unidadeAbrev}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botaoVoltar}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>{obterTituloCabecalho()}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('ListaTecidos')}
          style={styles.botaoVoltar}
        >
          <Ionicons name="layers-outline" size={20} color="#168bea" />
        </TouchableOpacity>
      </View>

      {/* ABAS DE FILTRO */}
      <View style={styles.abasContainer}>
        {abas.map((aba) => {
          const ativo = filtroAtivo === aba.chave;
          return (
            <TouchableOpacity
              key={aba.chave}
              style={[styles.abaBotao, ativo && styles.abaBotaoAtivo]}
              onPress={() => trocarAba(aba.chave)}
            >
              <Text style={[styles.abaTexto, ativo && styles.abaTextoAtivo]}>
                {aba.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* CONTADOR */}
      <View style={styles.contadorRow}>
        <Text style={styles.contadorTexto}>
          {lista.length} {lista.length === 1 ? 'registro encontrado' : 'registros encontrados'}
        </Text>
      </View>

      {/* LISTA */}
      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color="#168bea" />
        </View>
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listaContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.vazioContainer}>
              <Ionicons name="document-text-outline" size={46} color="#cbd5e1" />
              <Text style={styles.vazioTitulo}>Nenhum registro nesta categoria</Text>
              <Text style={styles.vazioSubtitulo}>
                As movimentações registradas aparecerão filtradas aqui.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '6%',
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  botaoVoltar: {
    padding: 4,
  },
  headerTitulo: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111',
  },
  abasContainer: {
    flexDirection: 'row',
    paddingHorizontal: '4%',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    justifyContent: 'space-between',
    gap: 4,
  },
  abaBotao: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  abaBotaoAtivo: {
    backgroundColor: '#168bea',
  },
  abaTexto: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#475569',
  },
  abaTextoAtivo: {
    color: '#fff',
  },
  contadorRow: {
    paddingHorizontal: '6%',
    paddingTop: 12,
    paddingBottom: 6,
  },
  contadorTexto: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  listaContent: {
    paddingHorizontal: '6%',
    paddingBottom: 30,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTipo: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748b',
  },
  cardNome: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111',
    marginTop: 2,
  },
  cardObs: {
    fontSize: 11,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 2,
  },
  cardQtd: {
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vazioContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  vazioTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#475569',
    marginTop: 10,
  },
  vazioSubtitulo: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
  },
});