import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import {
  listarProdutos,
  excluirProduto,
  registrarMovimentacao
} from '../database/database';

export default function ListaTecidosScreen({ navigation }) {
  const [tecidos, setTecidos] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);

  // Estados do Modal de Movimentação (Entrada / Saída / Ajuste)
  const [modalMovVisivel, setModalMovVisivel] = useState(false);
  const [tecidoSelecionado, setTecidoSelecionado] = useState(null);
  const [tipoMovimento, setTipoMovimento] = useState('entrada');
  const [qtdMovimento, setQtdMovimento] = useState('');
  const [observacao, setObservacao] = useState('');
  const [processando, setProcessando] = useState(false);

  // Estados do Modal de Visualização / Compartilhamento do QR Code
  const [modalQrVisivel, setModalQrVisivel] = useState(false);
  const [tecidoQr, setTecidoQr] = useState(null);
  const etiquetaRef = useRef(null);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const lista = await listarProdutos();
      setTecidos(lista);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os tecidos.');
    } finally {
      setCarregando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  const obterValorQr = (tecido) => {
    if (!tecido) return '';
    return tecido.qr_code && String(tecido.qr_code).trim() !== ''
      ? String(tecido.qr_code).trim()
      : `TEC-${tecido.id}`;
  };

  const obterComposicaoFormatada = (tecido) => {
    if (!tecido) return '';
    return [tecido.composicao, tecido.tipo, tecido.cor, tecido.tamanho]
      .filter(Boolean)
      .join(' • ');
  };

  const tecidosFiltrados = tecidos.filter((item) => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return true;
    return (
      item.nome?.toLowerCase().includes(termo) ||
      item.cor?.toLowerCase().includes(termo) ||
      item.tipo?.toLowerCase().includes(termo) ||
      item.composicao?.toLowerCase().includes(termo) ||
      obterValorQr(item).toLowerCase().includes(termo)
    );
  });

  const abrirModalMovimentacao = (tecido, tipoInicial) => {
    setTecidoSelecionado(tecido);
    setTipoMovimento(tipoInicial);
    setQtdMovimento('');
    setObservacao('');
    setModalMovVisivel(true);
  };

  const abrirModalQrCode = (tecido) => {
    setTecidoQr(tecido);
    setModalQrVisivel(true);
  };

  const handleCompartilharQrCode = async () => {
    if (!etiquetaRef.current || !tecidoQr) return;

    const nomeTecido = tecidoQr.nome;

    try {
      const uri = await captureRef(etiquetaRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      const disponivel = await Sharing.isAvailableAsync();
      if (!disponivel) {
        Alert.alert('Aviso', 'O compartilhamento não está disponível neste dispositivo.');
        return;
      }

      setModalQrVisivel(false);

      setTimeout(async () => {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: `Etiqueta QR Code - ${nomeTecido}`,
        });
      }, 300);
    } catch (error) {
      console.error('Erro ao compartilhar QR:', error);
      Alert.alert('Erro', 'Não foi possível exportar a imagem da etiqueta.');
    }
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
        observacao,
      });

      setModalMovVisivel(false);
      await carregarDados();
    } catch (error) {
      Alert.alert('Não foi possível movimentar', error.message || 'Erro ao registrar.');
    } finally {
      setProcessando(false);
    }
  };

  const handleExcluir = (item) => {
    Alert.alert(
      'Excluir tecido',
      `Deseja realmente remover "${item.nome}" e seu histórico?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluirProduto(item.id);
              await carregarDados();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o tecido.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const subtitulo = obterComposicaoFormatada(item);

    return (
      <View style={styles.card}>
        <View style={styles.cardTopo}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardNome}>{item.nome}</Text>
            {subtitulo ? <Text style={styles.cardSubtitulo}>{subtitulo}</Text> : null}
          </View>

          <TouchableOpacity
            onPress={() => handleExcluir(item)}
            style={styles.botaoExcluir}
          >
            <Ionicons name="trash-outline" size={18} color="#ff1744" />
          </TouchableOpacity>
        </View>

        <View style={styles.cardMeio}>
          <View style={styles.saldoBadge}>
            <Text style={styles.saldoLabel}>EM ESTOQUE</Text>
            <Text style={styles.saldoValor}>
              {String(item.quantidade).replace('.', ',')} {item.unidade}
            </Text>
          </View>

          <View style={styles.qrBadge}>
            <MaterialCommunityIcons name="qrcode" size={16} color="#168bea" />
            <Text style={styles.qrTexto} numberOfLines={1}>
              {obterValorQr(item)}
            </Text>
          </View>
        </View>

        <View style={styles.acoesRow}>
          <TouchableOpacity
            style={[styles.botaoAcao, { backgroundColor: '#e6f7f4' }]}
            onPress={() => abrirModalMovimentacao(item, 'entrada')}
          >
            <Ionicons name="add-circle-outline" size={16} color="#009688" />
            <Text style={[styles.textoAcao, { color: '#009688' }]}>ENTRADA</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botaoAcao, { backgroundColor: '#ffebee' }]}
            onPress={() => abrirModalMovimentacao(item, 'saida')}
          >
            <Ionicons name="remove-circle-outline" size={16} color="#ff1744" />
            <Text style={[styles.textoAcao, { color: '#ff1744' }]}>SAÍDA</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botaoAcao, { backgroundColor: '#e0f2fe' }]}
            onPress={() => abrirModalQrCode(item)}
          >
            <MaterialCommunityIcons name="qrcode-scan" size={15} color="#168bea" />
            <Text style={[styles.textoAcao, { color: '#168bea' }]}>VER QR</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botaoVoltar}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>ESTOQUE DE TECIDOS</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('CadastroTecido')}
          style={styles.botaoVoltar}
        >
          <Ionicons name="add-circle" size={24} color="#168bea" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#555" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome, composição, cor ou QR Code..."
            placeholderTextColor="#888"
            value={busca}
            onChangeText={setBusca}
          />
          {busca.length > 0 && (
            <TouchableOpacity onPress={() => setBusca('')}>
              <Ionicons name="close-circle" size={18} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      </View>

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
            <View style={styles.vazioBox}>
              <MaterialCommunityIcons name="package-variant" size={48} color="#cbd5e1" />
              <Text style={styles.vazioTitulo}>Nenhum tecido encontrado</Text>
              <Text style={styles.vazioSubtitulo}>
                Toque no "+" acima para cadastrar um novo rolo de tecido.
              </Text>
            </View>
          }
        />
      )}

      {/* MODAL 1: VISUALIZAR E COMPARTILHAR ETIQUETA QR CODE */}
      <Modal
        visible={modalQrVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setModalQrVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { alignItems: 'center' }]}>
            <View style={[styles.modalHeader, { width: '100%' }]}>
              <Text style={styles.modalTitulo}>ETIQUETA DO TECIDO</Text>
              <TouchableOpacity onPress={() => setModalQrVisivel(false)}>
                <Ionicons name="close" size={22} color="#555" />
              </TouchableOpacity>
            </View>

            {tecidoQr && (
              <>
                {/* Cartão de etiqueta capturado com fundo branco sólido */}
                <View
                  ref={etiquetaRef}
                  collapsable={false}
                  style={styles.etiquetaBox}
                >
                  <View style={styles.etiquetaTopo}>
                    <MaterialCommunityIcons name="tag-outline" size={14} color="#008585" />
                    <Text style={styles.etiquetaTagTopo}>IDENTIFICAÇÃO DE TECIDO</Text>
                  </View>

                  <Text style={styles.etiquetaNome}>{tecidoQr.nome.toUpperCase()}</Text>

                  {obterComposicaoFormatada(tecidoQr) ? (
                    <View style={styles.etiquetaComposicaoBox}>
                      <Text style={styles.etiquetaComposicaoLabel}>COMPOSIÇÃO / DETALHES</Text>
                      <Text style={styles.etiquetaComposicaoTexto}>
                        {obterComposicaoFormatada(tecidoQr)}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.qrWrapper}>
                    <QRCode
                      value={obterValorQr(tecidoQr)}
                      size={185}
                      quietZone={16}
                      color="#000000"
                      backgroundColor="#ffffff"
                    />
                  </View>

                  <View style={styles.etiquetaRodape}>
                    <Text style={styles.etiquetaCodigo}>{obterValorQr(tecidoQr)}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.botaoCompartilharQr}
                  onPress={handleCompartilharQrCode}
                >
                  <Ionicons name="share-social-outline" size={18} color="#fff" />
                  <Text style={styles.textoBotaoCompartilhar}>
                    COMPARTILHAR / IMPRIMIR ETIQUETA
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL 2: ENTRADA / SAÍDA / AJUSTE */}
      <Modal
        visible={modalMovVisivel}
        transparent
        animationType="slide"
        onRequestClose={() => setModalMovVisivel(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>MOVIMENTAR ESTOQUE</Text>
              <TouchableOpacity onPress={() => setModalMovVisivel(false)}>
                <Ionicons name="close" size={22} color="#555" />
              </TouchableOpacity>
            </View>

            {tecidoSelecionado && (
              <View style={styles.modalInfoProduto}>
                <Text style={styles.modalNomeProduto}>{tecidoSelecionado.nome}</Text>
                <Text style={styles.modalSaldoAtual}>
                  Saldo atual: {String(tecidoSelecionado.quantidade).replace('.', ',')}{' '}
                  {tecidoSelecionado.unidade}
                </Text>
              </View>
            )}

            <Text style={styles.modalLabel}>TIPO DE MOVIMENTAÇÃO:</Text>
            <View style={styles.tipoRow}>
              <TouchableOpacity
                style={[
                  styles.tipoBotao,
                  tipoMovimento === 'entrada' && {
                    backgroundColor: '#009688',
                    borderColor: '#009688',
                  },
                ]}
                onPress={() => setTipoMovimento('entrada')}
              >
                <Text
                  style={[
                    styles.tipoTexto,
                    tipoMovimento === 'entrada' && { color: '#fff' },
                  ]}
                >
                  ENTRADA (+)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tipoBotao,
                  tipoMovimento === 'saida' && {
                    backgroundColor: '#ff1744',
                    borderColor: '#ff1744',
                  },
                ]}
                onPress={() => setTipoMovimento('saida')}
              >
                <Text
                  style={[
                    styles.tipoTexto,
                    tipoMovimento === 'saida' && { color: '#fff' },
                  ]}
                >
                  SAÍDA (-)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tipoBotao,
                  tipoMovimento === 'ajuste do dia' && {
                    backgroundColor: '#f59e0b',
                    borderColor: '#f59e0b',
                  },
                ]}
                onPress={() => setTipoMovimento('ajuste do dia')}
              >
                <Text
                  style={[
                    styles.tipoTexto,
                    tipoMovimento === 'ajuste do dia' && { color: '#fff' },
                  ]}
                >
                  AJUSTE
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>
              {tipoMovimento === 'ajuste do dia'
                ? `NOVO SALDO REAL (${tecidoSelecionado?.unidade?.toUpperCase()}):`
                : `QUANTIDADE (${tecidoSelecionado?.unidade?.toUpperCase()}):`}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: 10,5"
              placeholderTextColor="#888"
              value={qtdMovimento}
              onChangeText={setQtdMovimento}
              keyboardType="numeric"
              autoFocus
            />

            <Text style={styles.modalLabel}>OBSERVAÇÃO (OPCIONAL):</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: Corte pedido #42, reposição..."
              placeholderTextColor="#888"
              value={observacao}
              onChangeText={setObservacao}
            />

            <TouchableOpacity
              style={[
                styles.modalBotaoConfirmar,
                tipoMovimento === 'saida' && { backgroundColor: '#ff1744' },
                tipoMovimento === 'entrada' && { backgroundColor: '#009688' },
                tipoMovimento === 'ajuste do dia' && { backgroundColor: '#f59e0b' },
              ]}
              onPress={handleConfirmarMovimentacao}
              disabled={processando}
            >
              {processando ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.modalTextoConfirmar}>CONFIRMAR</Text>
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
    backgroundColor: '#f5f6f8',
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
  searchWrapper: {
    paddingHorizontal: '6%',
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: '#111',
  },
  listaContent: {
    paddingHorizontal: '6%',
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardNome: {
    fontSize: 15,
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
  cardMeio: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  saldoBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saldoLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#64748b',
  },
  saldoValor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111',
    marginTop: 1,
  },
  qrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    maxWidth: '52%',
  },
  qrTexto: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#168bea',
    flexShrink: 1,
  },
  acoesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 6,
  },
  botaoAcao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  textoAcao: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vazioBox: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
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

  /* DESIGN DA ETIQUETA COMPARTILHÁVEL */
  etiquetaBox: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#008585',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    width: '100%',
    marginTop: 4,
  },
  etiquetaTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f7f4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
    marginBottom: 10,
  },
  etiquetaTagTopo: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#008585',
    letterSpacing: 0.8,
  },
  etiquetaNome: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
  },
  etiquetaComposicaoBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
    alignItems: 'center',
    width: '100%',
  },
  etiquetaComposicaoLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#64748b',
    letterSpacing: 0.6,
  },
  etiquetaComposicaoTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    marginTop: 2,
  },
  qrWrapper: {
    padding: 6,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginVertical: 14,
  },
  etiquetaRodape: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  etiquetaCodigo: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#168bea',
    letterSpacing: 0.8,
  },
  botaoCompartilharQr: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#168bea',
    height: 44,
    borderRadius: 10,
    width: '100%',
    marginTop: 16,
    gap: 8,
  },
  textoBotaoCompartilhar: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalInfoProduto: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  modalNomeProduto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111',
  },
  modalSaldoAtual: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
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