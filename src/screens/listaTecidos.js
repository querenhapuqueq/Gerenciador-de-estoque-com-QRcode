import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {
  listarProdutos,
  excluirProduto,
  registrarMovimentacao
} from '../database/database';

export default function ListaTecidosScreen({ navigation }) {
  const [tecidos, setTecidos] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);

  // Estados do Modal de Movimentação
  const [modalVisivel, setModalVisivel] = useState(false);
  const [tecidoSelecionado, setTecidoSelecionado] = useState(null);
  const [tipoMovimento, setTipoMovimento] = useState('saida'); // 'entrada' | 'saida' | 'ajuste do dia'
  const [qtdMovimento, setQtdMovimento] = useState('');
  const [observacao, setObservacao] = useState('');
  const [processando, setProcessando] = useState(false);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const lista = await listarProdutos();
      setTecidos(lista);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os tecidos.');
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  const abrirModalMovimentacao = (tecido, tipoInicial = 'saida') => {
    setTecidoSelecionado(tecido);
    setTipoMovimento(tipoInicial);
    setQtdMovimento('');
    setObservacao('');
    setModalVisivel(true);
  };

  const handleConfirmarMovimentacao = async () => {
    if (processando || !tecidoSelecionado) return;

    const valor = parseFloat(qtdMovimento.replace(',', '.'));
    if (!qtdMovimento || isNaN(valor) || valor <= 0) {
      Alert.alert('Atenção', 'Digite uma quantidade válida maior que zero.');
      return;
    }

    setProcessando(true);
    try {
      await registrarMovimentacao({
        produtoId: tecidoSelecionado.id,
        tipo: tipoMovimento,
        quantidade: qtdMovimento,
        observacao
      });

      setModalVisivel(false);
      carregarDados();
      Alert.alert('Sucesso!', 'Estoque atualizado e movimentação registrada.');
    } catch (error) {
      Alert.alert('Não foi possível movimentar', error.message || 'Erro ao atualizar estoque.');
    } finally {
      setProcessando(false);
    }
  };

  const handleExcluir = (id, nome) => {
    Alert.alert(
      'Excluir tecido',
      `Deseja realmente remover "${nome}" do estoque?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluirProduto(id);
              carregarDados();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o tecido.');
            }
          }
        }
      ]
    );
  };

  const tecidosFiltrados = tecidos.filter((item) => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return true;

    return (
      item.nome?.toLowerCase().includes(termo) ||
      item.cor?.toLowerCase().includes(termo) ||
      item.tipo?.toLowerCase().includes(termo) ||
      item.qr_code?.toLowerCase().includes(termo)
    );
  });

  const formatarMoeda = (valor) => {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitulo}>{item.nome}</Text>
          {(item.tipo || item.cor) && (
            <Text style={styles.cardSubtitulo}>
              {[item.tipo, item.cor].filter(Boolean).join(' • ')}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => handleExcluir(item.id, item.nome)}
          style={styles.botaoExcluir}
        >
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* DETALHES DE ESTOQUE E PREÇO */}
      <View style={styles.cardInfoLinha}>
        <View style={styles.badgeEstoque}>
          <Ionicons name="layers-outline" size={14} color="#168bea" />
          <Text style={styles.textoEstoque}>
            {String(item.quantidade).replace('.', ',')} {item.unidade}
          </Text>
        </View>

        {item.tamanho ? (
          <Text style={styles.textoDetalhe}>Larg: {item.tamanho}</Text>
        ) : null}

        {item.preco > 0 ? (
          <Text style={styles.textoPreco}>
            {formatarMoeda(item.preco)}/{item.unidade === 'metros' ? 'm' : item.unidade}
          </Text>
        ) : null}
      </View>

      {/* RODAPÉ: QR CODE + BOTÕES RÁPIDOS DE ENTRADA/SAÍDA */}
      <View style={styles.cardFooter}>
        <View style={styles.qrInfo}>
          {item.qr_code ? (
            <>
              <Ionicons name="qr-code-outline" size={14} color="#555" />
              <Text style={styles.textoQr}>{item.qr_code}</Text>
            </>
          ) : (
            <Text style={styles.semQr}>Sem etiqueta QR</Text>
          )}
        </View>

        <View style={styles.acoesLinha}>
          <TouchableOpacity
            style={[styles.botaoAcaoRapida, styles.botaoEntrada]}
            onPress={() => abrirModalMovimentacao(item, 'entrada')}
          >
            <Ionicons name="add" size={14} color="#fff" />
            <Text style={styles.textoAcaoRapida}>ENTRADA</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botaoAcaoRapida, styles.botaoSaida]}
            onPress={() => abrirModalMovimentacao(item, 'saida')}
          >
            <Ionicons name="remove" size={14} color="#fff" />
            <Text style={styles.textoAcaoRapida}>SAÍDA</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.botaoVoltar}
        >
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>

        <Text style={styles.headerTitulo}>ESTOQUE DE TECIDOS</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('CadastroTecido')}
          style={styles.botaoAdicionarHeader}
        >
          <Ionicons name="add" size={24} color="#168bea" />
        </TouchableOpacity>
      </View>

      {/* BARRA DE PESQUISA */}
      <View style={styles.buscaWrapper}>
        <View style={styles.buscaContainer}>
          <Ionicons name="search" size={18} color="#777" />
          <TextInput
            style={styles.buscaInput}
            placeholder="Buscar por nome, cor, tipo ou QR Code..."
            placeholderTextColor="#888"
            value={busca}
            onChangeText={setBusca}
            autoCapitalize="none"
          />
          {busca.length > 0 && (
            <TouchableOpacity onPress={() => setBusca('')}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* CONTADOR */}
      <View style={styles.contadorContainer}>
        <Text style={styles.contadorTexto}>
          {tecidosFiltrados.length}{' '}
          {tecidosFiltrados.length === 1 ? 'tecido encontrado' : 'tecidos encontrados'}
        </Text>
      </View>

      {/* LISTA */}
      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color="#168bea" />
        </View>
      ) : (
        <FlatList
          data={tecidosFiltrados}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listaContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.vazioContainer}>
              <Ionicons name="file-tray-outline" size={48} color="#cbd5e1" />
              <Text style={styles.vazioTitulo}>Nenhum tecido encontrado</Text>
              <Text style={styles.vazioSubtitulo}>
                {busca
                  ? 'Tente buscar por outro termo ou código.'
                  : 'Toque no botão "+" acima para cadastrar o primeiro rolo.'}
              </Text>
            </View>
          }
        />
      )}

      {/* MODAL DE MOVIMENTAÇÃO */}
      <Modal
        visible={modalVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisivel(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>MOVIMENTAR ESTOQUE</Text>
              <TouchableOpacity onPress={() => setModalVisivel(false)}>
                <Ionicons name="close" size={22} color="#555" />
              </TouchableOpacity>
            </View>

            {tecidoSelecionado && (
              <View style={styles.modalInfoProduto}>
                <Text style={styles.modalNomeProduto}>{tecidoSelecionado.nome}</Text>
                <Text style={styles.modalSaldoAtual}>
                  Saldo atual:{' '}
                  <Text style={{ fontWeight: 'bold', color: '#168bea' }}>
                    {String(tecidoSelecionado.quantidade).replace('.', ',')}{' '}
                    {tecidoSelecionado.unidade}
                  </Text>
                </Text>
              </View>
            )}

            {/* SELETOR DE TIPO DE MOVIMENTAÇÃO */}
            <Text style={styles.modalLabel}>TIPO DE OPERAÇÃO:</Text>
            <View style={styles.tipoRow}>
              <TouchableOpacity
                style={[
                  styles.tipoBotao,
                  tipoMovimento === 'entrada' && { backgroundColor: '#009688', borderColor: '#009688' }
                ]}
                onPress={() => setTipoMovimento('entrada')}
              >
                <Text
                  style={[
                    styles.tipoTexto,
                    tipoMovimento === 'entrada' && { color: '#fff' }
                  ]}
                >
                  ENTRADA (+)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tipoBotao,
                  tipoMovimento === 'saida' && { backgroundColor: '#ff1744', borderColor: '#ff1744' }
                ]}
                onPress={() => setTipoMovimento('saida')}
              >
                <Text
                  style={[
                    styles.tipoTexto,
                    tipoMovimento === 'saida' && { color: '#fff' }
                  ]}
                >
                  SAÍDA (-)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tipoBotao,
                  tipoMovimento === 'ajuste do dia' && { backgroundColor: '#f59e0b', borderColor: '#f59e0b' }
                ]}
                onPress={() => setTipoMovimento('ajuste do dia')}
              >
                <Text
                  style={[
                    styles.tipoTexto,
                    tipoMovimento === 'ajuste do dia' && { color: '#fff' }
                  ]}
                >
                  AJUSTE
                </Text>
              </TouchableOpacity>
            </View>

            {/* QUANTIDADE */}
            <Text style={styles.modalLabel}>
              {tipoMovimento === 'ajuste do dia'
                ? `NOVO SALDO REAL (${tecidoSelecionado?.unidade?.toUpperCase()}):`
                : `QUANTIDADE (${tecidoSelecionado?.unidade?.toUpperCase()}):`}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: 12,5"
              placeholderTextColor="#888"
              value={qtdMovimento}
              onChangeText={setQtdMovimento}
              keyboardType="numeric"
              autoFocus
            />

            {/* OBSERVAÇÃO */}
            <Text style={styles.modalLabel}>OBSERVAÇÃO (OPCIONAL):</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: Corte pedido #104, reposição..."
              placeholderTextColor="#888"
              value={observacao}
              onChangeText={setObservacao}
            />

            {/* BOTÃO CONFIRMAR */}
            <TouchableOpacity
              style={[
                styles.modalBotaoConfirmar,
                tipoMovimento === 'saida' && { backgroundColor: '#ff1744' },
                tipoMovimento === 'entrada' && { backgroundColor: '#009688' },
                tipoMovimento === 'ajuste do dia' && { backgroundColor: '#f59e0b' }
              ]}
              onPress={handleConfirmarMovimentacao}
              disabled={processando}
            >
              {processando ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.modalTextoConfirmar}>CONFIRMAR ATUALIZAÇÃO</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  botaoAdicionarHeader: {
    padding: 4,
  },
  headerTitulo: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111',
  },
  buscaWrapper: {
    paddingHorizontal: '6%',
    paddingTop: 14,
    paddingBottom: 8,
  },
  buscaContainer: {
    height: 42,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d5dbe0',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  buscaInput: {
    flex: 1,
    fontSize: 12,
    color: '#111',
    marginLeft: 8,
  },
  contadorContainer: {
    paddingHorizontal: '6%',
    paddingBottom: 8,
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111',
  },
  cardSubtitulo: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  botaoExcluir: {
    padding: 4,
  },
  cardInfoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  badgeEstoque: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  textoEstoque: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#168bea',
  },
  textoDetalhe: {
    fontSize: 11,
    color: '#475569',
  },
  textoPreco: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  qrInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  textoQr: {
    fontSize: 10,
    color: '#555',
    fontFamily: 'monospace',
  },
  semQr: {
    fontSize: 10,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  acoesLinha: {
    flexDirection: 'row',
    gap: 6,
  },
  botaoAcaoRapida: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 3,
  },
  botaoEntrada: {
    backgroundColor: '#009688',
  },
  botaoSaida: {
    backgroundColor: '#ff1744',
  },
  textoAcaoRapida: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
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
    paddingHorizontal: 20,
  },
  vazioTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#475569',
    marginTop: 12,
  },
  vazioSubtitulo: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
  },

  /* ESTILOS DO MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitulo: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111',
  },
  modalInfoProduto: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  modalNomeProduto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111',
  },
  modalSaldoAtual: {
    fontSize: 12,
    color: '#475569',
    marginTop: 3,
  },
  modalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    marginTop: 10,
  },
  tipoRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tipoBotao: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  tipoTexto: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
  },
  modalInput: {
    height: 42,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#111',
    backgroundColor: '#fff',
  },
  modalBotaoConfirmar: {
    height: 44,
    borderRadius: 10,
    backgroundColor: '#168bea',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  modalTextoConfirmar: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});