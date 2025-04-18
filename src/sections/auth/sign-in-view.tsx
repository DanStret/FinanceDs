import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';


// ----------------------------------------------------------------------

export function SignInView() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validarForm = () =>{
    const error:typeof errors = {}

    if(!email){
      error.email = 'El email es obligatorio';
    }else if(!/^\S+@\S+\.\S+$/.test(email)){
      error.email = 'Ingrese un email valido';
    }

    if(!password){
      error.password = 'La contraseña es obligatoria'
    }else if(password.length < 6){
      error.password = 'Minimo 6 caracteres';
    }

    setErrors(error);
    
    return Object.keys(error).length === 0;

  }
  ///------------------------------------------------------------------
  const validEmail = 'admin@gmail.com';
  const validPassword = 'admin1234';
  
  const handleSignIn = useCallback(() => {
    
    const esValido = validarForm();
    console.log('¿Formulario válido?', esValido);
    if (!esValido) return;
    if(email === validEmail && password === validPassword )
    {
      router.push('/dashboard');
      console.log('Formulario válido, enviar login...');
    }else{
      setErrors({...errors,email: ' credenciales incorrectas',password:' '})
    }

  }, [router, validarForm!]);

  const renderForm = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        flexDirection: 'column',
      }}
    >
      <TextField
      fullWidth
      name="email"
      label="Email"
      placeholder="example@gmail.com"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      error={Boolean(errors.email)}
      helperText={errors.email}
      sx={{ mb: 3 }}
      slotProps={{
        inputLabel: { shrink: true },
      }}
      />

      <Link variant="body2" color="inherit" sx={{ mb: 1.5 }}>
        Has olvidado tu contraseña?
      </Link>

      <TextField
        fullWidth
        name="password"
        label="Password"
        placeholder="password"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={Boolean(errors.password)}
        helperText={errors.password}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
      />

      <Button
        fullWidth
        size="large"
        type="submit"
        color="inherit"
        variant="contained"
        onClick={handleSignIn}
      >
        Sign in
      </Button>
    </Box>
  );

  return (
    <>
    
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 5,
        }}
      >
        <Typography variant="h5">Sign in</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          ¿No tienes una cuenta? 
          <Link variant="subtitle2" sx={{ ml: 0.5 }}>
            Empieza ahora
          </Link>
        </Typography>
      </Box>
      {renderForm}
      <Divider sx={{ my: 3, '&::before, &::after': { borderTopStyle: 'dashed' } }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 'fontWeightMedium' }}
        >
          OR
        </Typography>
      </Divider>
      <Box
        sx={{
          gap: 1,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <IconButton color="inherit">
          <Iconify width={22} icon="socials:google" />
        </IconButton>
        <IconButton color="inherit">
          <Iconify width={22} icon="socials:github" />
        </IconButton>
        <IconButton color="inherit">
          <Iconify width={22} icon="socials:twitter" />
        </IconButton>
      </Box>
    </>
  );
}
