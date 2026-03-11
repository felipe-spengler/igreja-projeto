FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de configuração primeiro para cache de camadas
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o restante dos arquivos
COPY . .

# Expor a porta padrão do Vite (5173)
EXPOSE 5173

# O comando final rodará o dev server do vite e fará o binding 0.0.0.0 para poder ser acessado de fora do container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
