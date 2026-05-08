-- Substitua 'seu-email@exemplo.com' pelo e-mail do usuário que você criou no Auth
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@orion.com');