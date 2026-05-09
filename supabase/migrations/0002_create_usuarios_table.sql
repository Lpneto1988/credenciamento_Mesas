-- Habilita a extensão necessária para gerar UUIDs, se ainda não estiver habilitada.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Remove a tabela antiga, se ela existir, para garantir uma recriação limpa.
DROP TABLE IF EXISTS public.usuarios;

-- Recria a tabela 'usuarios' com a estrutura correta.
-- A coluna 'id' agora terá um valor padrão gerado automaticamente.
CREATE TABLE public.usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  senha TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'operador')) DEFAULT 'operador',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recria a função para atualizar o campo 'updated_at' automaticamente.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recria o gatilho (trigger) que usa a função acima.
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON public.usuarios;
CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON public.usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
