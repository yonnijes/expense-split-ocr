# Domain Logic: Expense Splitting

## Reglas de Cálculo
1. Split Equitativo: IndividualDebt = Total / Participants.length
2. Split por Item:
   - Cada Item del ticket se asigna a 1 o más Participants.
   - Si un Item se asigna a varios, se divide el precio del item entre ellos.
   - La suma de los gastos individuales debe coincidir con el Total del ticket (validación de cierre).

## Estados del Ticket
- PENDING: Imagen subida, esperando respuesta de IA.
- VALIDATING: IA respondió, usuario corrigiendo datos.
- SPLITTING: Usuario asignando gastos.
- COMPLETED: Gastos divididos y listos para exportar.
