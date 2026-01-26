# Testes End-to-End (E2E) com Maestro

---

## 1. Objetivo dos Testes E2E

Os testes End-to-End (ponta a ponta) validam os **fluxos críticos** do aplicativo em um ambiente próximo ao real, executando ações do usuário em dispositivos/simuladores e verificando se o comportamento esperado ocorre corretamente.

### Principais objetivos:
- **Garantir a integridade dos fluxos principais** (login, agendamento, aceitação de consultas)
- **Validar integrações** entre frontend, backend e serviços externos

---

## 2. Ferramenta Escolhida: Maestro

A suíte de testes E2E foi implementada com **[Maestro](https://maestro.mobile.dev/)** porquê oferece:

- **Sintaxe declarativa em YAML**: fácil leitura e manutenção
- **Suporte nativo para iOS e Android**: sem configuração complexa
- **Execução em simuladores/emuladores e dispositivos reais**
- **Detecção inteligente de elementos** por testID, texto ou hierarquia

---

## 3. Estrutura da Suíte de Testes

A suíte está organizada no diretório `.maestro/` na raiz do projeto:

```
.maestro/
├─ config.yaml                                   # Configuração global (credenciais, app IDs)
├─ flows/
│  ├─ 01_patient_login.yaml                      # Login de paciente
│  ├─ 02_patient_schedule_appointment.yaml       # Paciente agenda consulta
│  ├─ 03_nutritionist_accept_appointment.yaml    # Nutricionista aceita solicitação
│  ├─ 04_nutritionist_view_agenda.yaml           # Nutricionista visualiza agenda
│  └─ 05_end_to_end_patient_to_nutri.yaml        # Fluxo completo: paciente → nutricionista
└─ README.md                                     # Documentação de uso
```

### Nomenclatura dos Flows
- **Prefixo numérico** (01, 02...): define ordem de execução sugerida
- **Nome descritivo**: indica claramente o que o flow testa
- Convenção: `<numero>_<perfil>_<acao>.yaml`

---

## 4. Cobertura de Testes

### 4.1. Login de Paciente (`01_patient_login.yaml`)
**Objetivo**: Validar autenticação de paciente com credenciais válidas.

**Fluxo**:
1. Insere email e senha do paciente
2. Clica no botão de login
3. Pula telas de permissão (calendário/notificações)
4. Verifica que a home do paciente é exibida

**Duração aproximada**: 25s

---

### 4.2. Agendamento de Consulta (`02_patient_schedule_appointment.yaml`)
**Objetivo**: Testar o fluxo completo de solicitação de consulta por um paciente.

**Fluxo**:
1. Login do paciente
2. Navegação para tela de agendamento
3. Seleção de horário disponível no calendário
4. Envio da solicitação
5. Validação de modal de sucesso

**Validações**:
- Calendário exibe dias disponíveis
- Horários disponíveis são listados
- Solicitação é enviada com sucesso
- Modal de confirmação aparece

**Duração aproximada**: 34s

---

### 4.3. Aceitação de Consulta (`03_nutritionist_accept_appointment.yaml`)
**Objetivo**: Validar que a nutricionista consegue aceitar solicitações pendentes.

**Fluxo**:
1. Login da nutricionista
2. Navegação para solicitações pendentes
3. Seleção da primeira solicitação
4. Confirmação de aceitação
5. Verificação de sucesso

**Validações**:
- Lista de pendentes é exibida
- Botão de aceitar funciona
- Modal de confirmação aparece
- Ação é processada corretamente

**Duração aproximada**: 29s

---

### 4.4. Visualização de Agenda (`04_nutritionist_view_agenda.yaml`)
**Objetivo**: Verificar que a nutricionista visualiza sua agenda de consultas aceitas.

**Fluxo**:
1. Login da nutricionista
2. Navegação para agenda
3. Verificação de elementos da tela

**Validações**:
- Tela de agenda carrega
- Calendário é exibido
- Consultas aceitas aparecem corretamente

**Duração aproximada**: 43s

---

### 4.5. Fluxo Completo Paciente → Nutricionista (`05_end_to_end_patient_to_nutri.yaml`)
**Objetivo**: Testar o ciclo completo desde a solicitação até a aceitação.

**Fluxo**:
1. **Fase 1 - Paciente**:
   - Login como paciente
   - Agendamento de consulta
   - Confirmação de envio
2. **Fase 2 - Nutricionista**:
   - Reinicialização do app (clearState)
   - Login como nutricionista
   - Visualização de solicitação pendente
   - Aceitação da consulta

**Validações**:
- Integração entre perfis funciona
- Solicitação criada pelo paciente aparece para nutricionista
- Estado de consulta é atualizado corretamente no backend
- Notificações são disparadas (quando aplicável)

**Duração aproximada**: 1m 3s

**Relevância**: Este é o **teste mais crítico**, pois valida o fluxo de negócio principal do app.

---

## 5. Requisitos Funcionais Cobertos

Os testes E2E validam diretamente os seguintes requisitos funcionais (ver [RF.md](RF.md)):

| RF | Descrição | Flow(s) |
|----|-----------|---------|
| RF01 | Autenticação de usuários | 01, 02, 03, 04, 05 |
| RF04 | Exibir dias/horários disponíveis | 02, 05 |
| RF05 | Solicitar consulta | 02, 05 |
| RF06 | Registrar solicitação de consulta | 02, 05 |
| RF07 | Listar solicitações pendentes | 03, 05 |
| RF08 | Aceitar ou recusar solicitação | 03, 05 |
| RF09 | Verificar consultas aceitas | 03, 05 |
| RF10 | Impedir conflitos de horário | 05 |
| RF11 | Visualizar agenda da nutricionista | 04, 05 |

---

**Referências**:
- [Maestro Documentation](https://maestro.mobile.dev/getting-started/introduction)
- [RF.md](RF.md) - Requisitos Funcionais
- [RNF.md](RNF.md) - Requisitos Não Funcionais
- [ARQUITETURA.md](ARQUITETURA.md) - Guia de Arquitetura
