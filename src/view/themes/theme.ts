export const colors = {
    primary: '#587766',           // Verde principal (loader, botões)
    primaryLight: '#E3EAE5',      // Verde claro (backgrounds suaves)
    secondary: '#8BC34A',         // Verde secundário
    
    // Backgrounds
    background: '#FFFFFF',        // Fundo branco (telas claras)
    backgroundDark: '#020203',    // Fundo escuro (telas escuras)
    surface: '#F5F5F7',           // Superfícies elevadas
    inputBackground: '#E4E4DC',   // Fundo dos inputs
    white: '#FFFFFF',             // Branco puro
    
    text: '#394247',              // Texto principal (fundo claro)
    textLight: '#E5ECEF',         // Texto principal (fundo escuro)
    textSecondary: '#8F979B',     // Texto secundário
    
    error: '#cf2e23ff',             // Vermelho para erros
    errorLight: '#FFEBEE',        // Vermelho claro (backgrounds)
    success: '#4CAF50',           // Verde para sucesso
    warning: '#FFC107',           // Amarelo para avisos
    pending: '#e38d0cff',           // Laranja para pendente
    cancelled: '#9E9E9E',         // Cinza para cancelado
    border: '#E0E0E0',            // Cinza para bordas
};

export const fonts = {
    regular: 'HelveticaNeue',
    medium: 'HelveticaNeue-Medium',
    semibold: 'HelveticaNeue-Medium',
    bold: 'HelveticaNeue-Bold',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 64,
};

export const fontSizes = {
    xs: 10,
    sm: 12,
    smMd: 14,
    md: 16,
    mdLg: 18,
    lg: 19,
    lgMd: 22,
    xl: 24,
    xl2: 28,
    xxl: 32,
    xxxl: 40,
};

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 20,
    full: 9999,
};

export const theme = {
    colors,
    fonts,
    spacing,
    fontSizes,
    borderRadius,
};

export default theme;
