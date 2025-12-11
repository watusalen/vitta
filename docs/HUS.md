<!--
Objetivo: Documentar as histórias de usuário do perfil Sistema.
Escopo: Funcionalidades e necessidades do sistema no agendamento.
-->

## Histórias de Usuário - Sistema

---

### Perfil: Sistema

**Story S01**  
Como sistema, devo evitar marcar duas consultas no mesmo horário para a nutricionista, para garantir que não haja conflitos de agenda.  
**UC Relacionados:** [UC06](./UC.md#uc06--aceitar-solicitação-de-consulta), [UC13](./UC.md#uc13--reativar-consulta-cancelada-nutricionista)

**Story S02**  
Como sistema, devo atualizar o status das consultas em tempo real (via Firebase), para que pacientes e nutricionista vejam sempre informações atualizadas.  
**UC Relacionados:** [UC06](./UC.md#uc06--aceitar-solicitação-de-consulta), [UC07](./UC.md#uc07--recusar-solicitação-de-consulta), [UC12](./UC.md#uc12--cancelar-consulta), [UC13](./UC.md#uc13--reativar-consulta-cancelada-nutricionista)

**Story S03**  
Como sistema, devo agendar notificações locais no dispositivo do paciente quando uma consulta for aceita, para garantir que ele será lembrado da consulta.  
**UC Relacionado:** [UC11](./UC.md#uc11--agendar-notificações-de-lembrete)