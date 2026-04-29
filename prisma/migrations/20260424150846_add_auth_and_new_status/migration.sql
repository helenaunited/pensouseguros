-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Colaborador" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "funcao" TEXT NOT NULL,
    "senha" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT 'colaborador',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Colaborador" ("ativo", "createdAt", "email", "funcao", "id", "nome", "telefone") SELECT "ativo", "createdAt", "email", "funcao", "id", "nome", "telefone" FROM "Colaborador";
DROP TABLE "Colaborador";
ALTER TABLE "new_Colaborador" RENAME TO "Colaborador";
CREATE UNIQUE INDEX "Colaborador_email_key" ON "Colaborador"("email");
CREATE TABLE "new_Demanda" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Aguardando',
    "prioridade" TEXT NOT NULL DEFAULT 'Normal',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prazo" DATETIME NOT NULL,
    "colaborador_id" TEXT NOT NULL,
    CONSTRAINT "Demanda_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "Colaborador" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Demanda" ("colaborador_id", "createdAt", "descricao", "id", "prazo", "prioridade", "status", "titulo") SELECT "colaborador_id", "createdAt", "descricao", "id", "prazo", "prioridade", "status", "titulo" FROM "Demanda";
DROP TABLE "Demanda";
ALTER TABLE "new_Demanda" RENAME TO "Demanda";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
