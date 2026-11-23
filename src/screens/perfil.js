import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  atualizarNomeUsuario,
  alterarSenhaUsuario
} from '../database/database';

export default function PerfilScreen({ navigation, route }) {
  const [usuario, setUsuario] = useState(
    route?.params?.usuario || {
      id: null,
      nome: 'Usuário',
      email: 'Não informado'
    }
  );

  // Estados do Modal de Editar Nome
  const [modalNomeVisivel, setModalNomeVisivel] = useState(false);
  const [novoNome, setNovoNome] = useState(usuario.nome);
  const [salvandoNome, setSalvandoNome] = useState(false);

  // Estados do Modal de Alterar Senha
  const [modalSenhaVisivel, setModalSenhaVisivel] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenhas, setMostrarSenhas] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  const obterIniciais = (nomeCompleto) => {
    if (!nomeCompleto) return 'U';
    const partes = nomeCompleto.trim().split(' ').filter(Boolean);
    if (partes.length === 1) return partes[0][0].toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  };

  const abrirModalNome = () => {
    setNovoNome(usuario.nome);
    setModalNomeVisivel(true);
  };

  const handleSalvarNome = async () => {
    if (salvandoNome) return;

    if (!usuario.id) {
      Alert.alert('Aviso', 'Faça login novamente para editar os dados da conta.');
      return;
    }

    if (!novoNome.trim()) {
      Alert.alert('Atenção', 'Informe o novo nome.');
      return;
    }

    setSalvandoNome(true);
    try {
      const nomeAtualizado = await atualizarNomeUsuario(usuario.id, novoNome);
      const usuarioAtualizado = { ...usuario, nome: nomeAtualizado };

      setUsuario(usuarioAtualizado);
      setModalNomeVisivel(false);
      Alert.alert('Sucesso!', 'Seu nome foi atualizado.');
    } catch (error) {
      Alert.alert('Erro', error.message || 'Não foi possível atualizar o nome.');
    } finally {
      setSalvandoNome(false);
    }
  };

  const abrirModalSenha = () => {
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarSenha('');
    setMostrarSenhas(false);
    setModalSenhaVisivel(true);
  };

  const handleSalvarSenha = async () => {
    if (salvandoSenha) return;

    if (!usuario.id) {
      Alert.alert('Aviso', 'Faça login novamente para alterar a senha.');
      return;
    }

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      Alert.alert('Atenção', 'Preencha todos os campos de senha.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      Alert.alert('Atenção', 'A nova senha e a confirmação não coincidem.');
      return;
    }

    setSalvandoSenha(true);
    try {
      await alterarSenhaUsuario(usuario.id, senhaAtual, novaSenha);
      setModalSenhaVisivel(false);
      Alert.alert('Sucesso!', 'Sua senha foi alterada com segurança.');
    } catch (error) {
      Alert.alert('Não foi possível alterar', error.message || 'Erro ao alterar senha.');
    } finally {
      setSalvandoSenha(false);
    }
  };

  const handleVoltarParaHome = () => {
    navigation.navigate('Home', { usuario });
  };

  const handleSair = () => {
    Alert.alert(
      'Sair da conta',
      'Deseja realmente sair e voltar para a tela de login?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleVoltarParaHome}
          style={styles.botaoVoltar}
        >
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>MEU PERFIL</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* CARTÃO DE AVATAR E NOME */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCirculo}>
            <Text style={styles.avatarTexto}>{obterIniciais(usuario.nome)}</Text>
          </View>
          <Text style={styles.nomePrincipal}>{usuario.nome}</Text>
        </View>

        {/* INFORMAÇÕES DA CONTA */}
        <Text style={styles.secaoTitulo}>INFORMAÇÕES DA CONTA</Text>
        <View style={styles.cardInfo}>
          {/* Linha Nome + Botão Editar */}
          <View style={styles.infoLinha}>
            <View style={styles.iconeBox}>
              <Ionicons name="person-outline" size={20} color="#168bea" />
            </View>
            <View style={styles.infoTextos}>
              <Text style={styles.infoLabel}>NOME COMPLETO</Text>
              <Text style={styles.infoValor}>{usuario.nome}</Text>
            </View>
            <TouchableOpacity onPress={abrirModalNome} style={styles.botaoEditarInline}>
              <Ionicons name="create-outline" size={20} color="#168bea" />
            </TouchableOpacity>
          </View>

          <View style={styles.divisor} />

          {/* Linha E-mail */}
          <View style={styles.infoLinha}>
            <View style={styles.iconeBox}>
              <Ionicons name="mail-outline" size={20} color="#168bea" />
            </View>
            <View style={styles.infoTextos}>
              <Text style={styles.infoLabel}>E-MAIL CADASTRADO</Text>
              <Text style={styles.infoValor}>{usuario.email}</Text>
            </View>
          </View>

          {usuario.id ? (
            <>
              <View style={styles.divisor} />
              <View style={styles.infoLinha}>
                <View style={styles.iconeBox}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#009688" />
                </View>
                <View style={styles.infoTextos}>
                  <Text style={styles.infoLabel}>STATUS DA CONTA</Text>
                  <Text style={[styles.infoValor, { color: '#009688' }]}>
                    Ativa • ID #{usuario.id}
                  </Text>
                </View>
              </View>
            </>
          ) : null}
        </View>

        {/* SEGURANÇA */}
        <Text style={[styles.secaoTitulo, { marginTop: 22 }]}>SEGURANÇA</Text>
        <TouchableOpacity
          style={styles.cardSeguranca}
          onPress={abrirModalSenha}
          activeOpacity={0.7}
        >
          <View style={styles.iconeBox}>
            <Ionicons name="lock-closed-outline" size={20} color="#168bea" />
          </View>
          <View style={styles.infoTextos}>
            <Text style={styles.infoValor}>Alterar Senha</Text>
            <Text style={styles.subtextoSeguranca}>Atualize sua senha de acesso</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        {/* BOTÃO SAIR DA CONTA */}
        <TouchableOpacity
          style={styles.botaoSair}
          onPress={handleSair}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.textoBotaoSair}>SAIR DA CONTA</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL: EDITAR NOME */}
      <Modal
        visible={modalNomeVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setModalNomeVisivel(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>EDITAR NOME</Text>
              <TouchableOpacity onPress={() => setModalNomeVisivel(false)}>
                <Ionicons name="close" size={22} color="#555" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>NOVO NOME COMPLETO:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Digite seu nome"
              placeholderTextColor="#888"
              value={novoNome}
              onChangeText={setNovoNome}
              autoFocus
            />

            <TouchableOpacity
              style={styles.modalBotaoConfirmar}
              onPress={handleSalvarNome}
              disabled={salvandoNome}
            >
              {salvandoNome ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.modalTextoConfirmar}>SALVAR NOME</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL: ALTERAR SENHA */}
      <Modal
        visible={modalSenhaVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setModalSenhaVisivel(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>ALTERAR SENHA</Text>
              <TouchableOpacity onPress={() => setModalSenhaVisivel(false)}>
                <Ionicons name="close" size={22} color="#555" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>SENHA ATUAL:</Text>
            <View style={styles.senhaInputRow}>
              <TextInput
                style={styles.senhaInput}
                placeholder="Digite sua senha atual"
                placeholderTextColor="#888"
                value={senhaAtual}
                onChangeText={setSenhaAtual}
                secureTextEntry={!mostrarSenhas}
              />
              <TouchableOpacity onPress={() => setMostrarSenhas(!mostrarSenhas)}>
                <Ionicons
                  name={mostrarSenhas ? 'eye-off' : 'eye'}
                  size={18}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>NOVA SENHA:</Text>
            <View style={styles.senhaInputRow}>
              <TextInput
                style={styles.senhaInput}
                placeholder="Mínimo 4 caracteres"
                placeholderTextColor="#888"
                value={novaSenha}
                onChangeText={setNovaSenha}
                secureTextEntry={!mostrarSenhas}
              />
            </View>

            <Text style={styles.modalLabel}>CONFIRMAR NOVA SENHA:</Text>
            <View style={styles.senhaInputRow}>
              <TextInput
                style={styles.senhaInput}
                placeholder="Repita a nova senha"
                placeholderTextColor="#888"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry={!mostrarSenhas}
              />
            </View>

            <TouchableOpacity
              style={styles.modalBotaoConfirmar}
              onPress={handleSalvarSenha}
              disabled={salvandoSenha}
            >
              {salvandoSenha ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.modalTextoConfirmar}>ATUALIZAR SENHA</Text>
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
  scrollContent: {
    paddingHorizontal: '6%',
    paddingTop: 28,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarCirculo: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#168bea',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  avatarTexto: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  nomePrincipal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  secaoTitulo: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 8,
  },
  cardInfo: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  iconeBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoTextos: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748b',
  },
  infoValor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginTop: 2,
  },
  botaoEditarInline: {
    padding: 6,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
  },
  divisor: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  cardSeguranca: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  subtextoSeguranca: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  botaoSair: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff1744',
    height: 46,
    borderRadius: 12,
    marginTop: 32,
    gap: 8,
    elevation: 2,
  },
  textoBotaoSair: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  /* ESTILOS DOS MODAIS */
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
  modalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    marginTop: 10,
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
  senhaInputRow: {
    height: 42,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  senhaInput: {
    flex: 1,
    fontSize: 13,
    color: '#111',
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