# Modelo de Entidades e Relacionamentos

Objetivo: consolidar entidades, atributos e relacionamentos usados nas sprints. Baseado nas regras atuais (MVP) e nas integrações previstas.

## Convenções
- IDs: strings UUID geradas via `crypto.randomUUID()` nas factories de domínio.
- Datas/horas: ISO 8601 (`YYYY-MM-DD`), horário em string (`HH:mm`) ou timestamps do Firestore.
- Status: usar enum definido no domínio (ver `AppointmentStatus`).
- Status (UI): o app exibe em português, mas persiste em inglês (`pending`, `accepted`, `rejected`, `cancelled`).
- Disponibilidade: slots fixos (Seg-Sex) 09:00-11:00, 11:00-13:00, 13:00-15:00, 14:00-16:00.

## Entidades

### User
- `id`: string
- `name`: string
- `email`: string
- `role`: "patient" | "nutritionist"
- `createdAt`: timestamp
- `pushTokens`: string[] (lista de ExpoPushToken)

### Appointment
- `id`: string
- `patientId`: string (ref `User` role patient)
- `nutritionistId`: string (ref `User` role nutritionist)
- `date`: string (`YYYY-MM-DD`)
- `timeStart`: string (`HH:mm`)
- `timeEnd`: string (`HH:mm`)
- `status`: "pending" | "accepted" | "rejected" | "cancelled"
- `calendarEventIdPatient`: string | null
- `calendarEventIdNutritionist`: string | null
- `createdAt`: timestamp
- `updatedAt`: timestamp

### TimeSlot (valor gerado, não persistido)
- `date`: string (`YYYY-MM-DD`)
- `timeStart`: string (`HH:mm`)
- `timeEnd`: string (`HH:mm`)
- `available`: boolean

> `TimeSlot` é calculado a partir da regra fixa de disponibilidade e removendo horários já aceitos. Horários com solicitação pendente do próprio paciente também não são exibidos. Solicitações pendentes de outros pacientes podem aparecer, mas o envio é bloqueado no momento da solicitação.

## Relacionamentos
- `User (patient)` 1 --- N `Appointment` (via `patientId`).
- `User (nutritionist)` 1 --- N `Appointment` (via `nutritionistId`).

## Regras e Observações
- Status inicial: `pending` ao solicitar.
- Transições válidas: `pending -> accepted | rejected | cancelled`; `accepted -> cancelled`; `cancelled -> accepted` (reativação com checagem de conflito).
- Conflito: não pode existir mais de um `Appointment` `accepted` no mesmo `date + timeStart + timeEnd` para o mesmo `nutritionistId` (e para o paciente também, por segurança).
- Solicitação: não pode existir `Appointment` `pending` ou `accepted` no mesmo `date + timeStart + timeEnd` para o mesmo `nutritionistId`.
- Cancelamento: paciente pode cancelar `pending` ou `accepted`; nutricionista cancela apenas `accepted` (pendentes devem ser recusadas).
- Reativação é ação do nutricionista e requer nova verificação de conflito.
- Eventos de calendário são criados apenas quando a consulta é aceita e removidos quando cancelada/recusada.

## Mapeamento Firestore
- `users/{userId}` → documento `User`.
- `appointments/{appointmentId}` → documento `Appointment`.

### Índices sugeridos
 - `appointments`: `patientId`, `date`, `status` (compostos para listas por paciente e por dia).
 - `appointments`: `nutritionistId`, `date`, `status` (listas da nutricionista e agenda diária).

## Exemplo de Documento (Appointment)
```json
{
  "id": "appt-123",
  "patientId": "user-abc",
  "nutritionistId": "user-nutri-1",
  "date": "2025-12-10",
  "timeStart": "09:00",
  "timeEnd": "11:00",
  "status": "pending",
  "calendarEventIdPatient": null,
  "calendarEventIdNutritionist": null,
  "createdAt": "2025-12-01T12:00:00Z",
  "updatedAt": "2025-12-01T12:00:00Z"
}
```
