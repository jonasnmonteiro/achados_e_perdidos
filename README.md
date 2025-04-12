# Sistema de Achados e Perdidos

Aplicação backend para cadastro de itens perdidos e encontrados em locais públicos.

## Tecnologias
- Node.js + Express
- PostgreSQL + Prisma
- Multer (upload de imagens)
- Insomnia (testes)

## Como rodar

```bash
git clone https://github.com/seu-usuario/achados-e-perdidos.git
cd achados-e-perdidos
npm install
cp .env.example .env
# Edite o .env.exemplo com seus dados
npx prisma migrate dev
npm run dev
