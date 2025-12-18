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
    
    // Textos
    text: '#394247',              // Texto principal (fundo claro)
    textLight: '#E5ECEF',         // Texto principal (fundo escuro)
    textSecondary: '#8F979B',     // Texto secundário
    
    error: '#F44336',             // Vermelho para erros
    success: '#4CAF50',           // Verde para sucesso
    warning: '#FFC107',           // Amarelo para avisos
    pending: '#FF9800',           // Laranja para pendente
    cancelled: '#9E9E9E',         // Cinza para cancelado
};

export const fonts = {
    regular: 'HelveticaNeue',
    medium: 'HelveticaNeue-Medium',
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
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
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
