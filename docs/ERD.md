# Modelo de Entidades e Relacionamentos

Objetivo: consolidar entidades, atributos e relacionamentos usados nas sprints. Baseado nas regras atuais (MVP) e nas integrações previstas.

## Convenções
- IDs: strings UUID geradas via `crypto.randomUUID()` nas factories de domínio.
- Datas/horas: ISO 8601 (`YYYY-MM-DD`), horário em string (`HH:mm`) ou timestamps do Firestore.
- Status: usar enum definido no domínio (ver `AppointmentStatus`).
- Disponibilidade: slots fixos (Seg-Sex) 09:00-11:00, 11:00-13:00, 13:00-15:00, 14:00-16:00.

## Entidades

### User
- `id`: string
- `name`: string
- `email`: string
- `role`: "patient" | "nutritionist"
- `createdAt`: timestamp

### Appointment
- `id`: string
- `patientId`: string (ref `User` role patient)
- `nutritionistId`: string (ref `User` role nutritionist)
- `date`: string (`YYYY-MM-DD`)
- `timeStart`: string (`HH:mm`)
- `timeEnd`: string (`HH:mm`)
- `status`: "pending" | "accepted" | "rejected" | "cancelled"
- `createdAt`: timestamp
- `updatedAt`: timestamp

### TimeSlot (valor gerado, não persistido)
- `date`: string (`YYYY-MM-DD`)
- `timeStart`: string (`HH:mm`)
- `timeEnd`: string (`HH:mm`)
- `available`: boolean

> `TimeSlot` é calculado a partir da regra fixa de disponibilidade e removendo horários já aceitos.

## Relacionamentos
- `User (patient)` 1 --- N `Appointment` (via `patientId`).
- `User (nutritionist)` 1 --- N `Appointment` (via `nutritionistId`).

## Regras e Observações
- Status inicial: `pending` ao solicitar.
- Transições válidas: `pending -> accepted | rejected | cancelled`; `accepted -> cancelled`; `cancelled -> accepted` (reativação com checagem de conflito).
- Conflito: não pode existir mais de um `Appointment` `accepted` no mesmo `date + timeStart + timeEnd` para o mesmo `nutritionistId` (e para o paciente também, por segurança).
- Cancelamento pode ser feito por paciente ou nutricionista quando status é `pending` ou `accepted`.
- Reativação é ação do nutricionista e requer nova verificação de conflito.

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
  "createdAt": "2025-12-01T12:00:00Z",
  "updatedAt": "2025-12-01T12:00:00Z"
}
```
