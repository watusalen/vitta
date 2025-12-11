<!--
Objetivo: Listar os requisitos funcionais do sistema de agendamento.
Escopo: Funcionalidades obrigatórias para o funcionamento do sistema.
-->

## Requisitos Funcionais (RF)

**RF01 – Autenticação de usuários**  
O sistema deve permitir que nutricionista e pacientes façam login com e-mail/senha para acessar o aplicativo.

**RF02 – Registro de pacientes**  
O sistema deve permitir que novos pacientes se registrem no aplicativo informando nome, e-mail e senha. O paciente é o único perfil que realiza auto-cadastro. A nutricionista (Jesseane) será cadastrada diretamente no Firebase pelo administrador do sistema. Não haverá funcionalidade de edição de perfil ou recuperação de senha no aplicativo (gerenciadas manualmente no Firebase).

**RF03 – Diferenciar perfis (nutricionista / paciente)**  
O sistema deve identificar o tipo de usuário (nutricionista ou paciente) a partir do login e mostrar telas/funcionalidades adequadas para cada perfil. O sistema possui apenas uma nutricionista.

**RF04 – Exibir dias/horários disponíveis para consulta (lado paciente)**  
O sistema deve exibir para o paciente um calendário interativo onde:
- O paciente visualiza um calendário mensal com os dias disponíveis destacados
- Ao clicar em um dia, são exibidos os horários vagos daquele dia
- Dias sem horários disponíveis ficam desabilitados/esmaecidos
- A disponibilidade é configurada no sistema: **Segunda a Sexta-feira, das 9h às 16h, consultas de 2 horas cada** (9h-11h, 11h-13h, 13h-15h, 14h-16h)
- Horários já ocupados por consultas aceitas não são exibidos
- Fins de semana e feriados não são disponíveis

**RF05 – Solicitar consulta**  
O sistema deve permitir que o paciente selecione um dia e horário disponível (que não tenha consultas já confirmadas pela nutricionista), informe dados mínimos (nome, idade, contato) e opcionalmente forneça observações adicionais sobre a consulta antes de enviar a solicitação.

**RF06 – Registrar solicitação de consulta**  
Ao solicitar uma consulta, o sistema deve registrar a solicitação com status inicial "pendente".

**RF07 – Listar solicitações pendentes para a nutricionista**  
O sistema deve permitir que a nutricionista visualize uma lista de todas as solicitações com status pendente, incluindo data, horário e identificação do paciente.

**RF08 – Aceitar ou recusar solicitação de consulta**  
A nutricionista deve poder aceitar ou recusar uma solicitação de consulta.  
Aceitar → muda status para "aceita".  
Recusar → muda status para "recusada".

**RF09 – Verificar as consultas aceitas**  
O sistema deve verificar se já existe outra consulta aceita no mesmo dia/horário para aquela nutricionista.

**RF10 – Impedir conflitos de horário**  
Ao aceitar uma consulta em uma data e horário, o sistema deve impedir novos registros na mesma data e horário, bloqueando conflitos.

**RF11 – Visualizar agenda confirmada da nutricionista (lado da nutricionista)**  
O sistema deve permitir que a nutricionista veja todas as consultas com status "aceita", em visão de lista ou calendário (por dia/semana).

**RF12 – Visualizar solicitações pendentes da nutricionista (lado da nutricionista)**  
O sistema deve permitir que a nutricionista veja todas as consultas com status "pendente", em visão de lista (por dia/semana).

**RF13 – Visualizar solicitações canceladas da nutricionista (lado da nutricionista)**  
O sistema deve permitir que a nutricionista veja todas as consultas com status "cancelada", em visão de lista (por dia/semana).

**RF14 – Visualizar status das solicitações (lado paciente)**  
O paciente deve poder consultar as suas solicitações e ver o status de cada uma: pendente, aceita ou recusada.

**RF15 – Criar evento no calendário do dispositivo (paciente)**  
Quando uma consulta for aceita, o app do paciente deve permitir criar automaticamente um evento no calendário do dispositivo, com data, horário e identificação da consulta.

**RF16 – Criar evento no calendário do dispositivo (nutricionista)**  
Quando a nutricionista aceitar uma consulta, o app dela também deve oferecer a criação/atualização do evento no calendário do dispositivo.

**RF17 – Agendar notificações de lembrete (lado paciente)**  
O sistema deve agendar notificações locais no dispositivo do paciente para lembrá-lo da consulta em horários pré-definidos (ex.: 24h antes e 1h antes).

**RF18 – Notificação para o paciente em caso de atualização de status**  
Quando a nutricionista aceitar ou recusar uma solicitação, o sistema deve avisar o paciente com notificação push.

**RF19 – Visualizar detalhes da consulta**  
O sistema deve permitir que a nutricionista e o paciente visualizem detalhes de uma consulta específica: data, horário e status.

**RF20 – Cancelar consulta (paciente ou nutricionista)**  
O sistema deve permitir que o paciente ou a nutricionista cancele uma consulta aceita, atualizando o status para "cancelled", removendo o evento do calendário, cancelando notificações agendadas e notificando a outra parte.

**RF21 – Reativar consulta cancelada (nutricionista)**  
O sistema deve permitir que a nutricionista aceite novamente uma consulta que foi cancelada (por ela ou pelo paciente), verificando conflitos de horário, atualizando o status para "accepted" e notificando o paciente.
