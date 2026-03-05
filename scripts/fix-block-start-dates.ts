/**
 * Script one-shot: corrige o start_date de blocos onde a data de início
 * não cai em nenhum dos dias_da_semana da alocação.
 *
 * O valor correto é a data da primeira sessão já gerada para o bloco.
 *
 * Como rodar:
 *   npx ts-node -r tsconfig-paths/register scripts/fix-block-start-dates.ts
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

function jsToIsoDow(jsDow: number): number {
  return jsDow === 0 ? 7 : jsDow;
}

async function main() {
  const blocks = await prisma.block.findMany({
    include: {
      sessions: { orderBy: { date: 'asc' }, take: 1 },
    },
  });

  let fixed = 0;
  let skipped = 0;

  for (const block of blocks) {
    const startDateIsoDow = jsToIsoDow(new Date(block.start_date).getUTCDay());
    const alreadyValid = (block.days_of_week as number[]).includes(startDateIsoDow);

    if (alreadyValid) {
      skipped++;
      continue;
    }

    const firstSession = block.sessions[0];
    if (!firstSession) {
      console.warn(`⚠ Bloco "${block.name}" (${block.id}) não tem sessões — ignorado.`);
      skipped++;
      continue;
    }

    const correctStartDate = firstSession.date;
    const oldStr = block.start_date.toISOString().split('T')[0];
    const newStr = correctStartDate.toISOString().split('T')[0];

    await prisma.block.update({
      where: { id: block.id },
      data: { start_date: correctStartDate },
    });

    console.log(`✓ "${block.name}" (${block.id}): ${oldStr} → ${newStr}`);
    fixed++;
  }

  console.log(`\nConcluído: ${fixed} corrigido(s), ${skipped} ignorado(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
