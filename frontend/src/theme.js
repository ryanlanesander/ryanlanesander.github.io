import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      red: '#7B3334',
      redLight: 'rgb(123,51,52)',
      redDark: 'rgb(84,56,37)',   // navbar brown
      gold: '#D4AF37',
      goldDark: '#b9972d',
    },
  },
  fonts: {
    heading: `'Playfair Display', serif`,
    body: `'Open Sans', sans-serif`,
  },
  styles: {
    global: {
      body: {
        bg: 'brand.red',
        color: 'brand.gold',
        fontFamily: 'body',
      },
      'h1, h2, h3, h4, h5, h6': {
        fontFamily: 'heading',
        color: 'brand.gold',
      },
      a: {
        color: 'brand.gold',
        _hover: { color: 'brand.goldDark' },
      },
      'html': {
        scrollBehavior: 'smooth',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: '8px',
        fontFamily: 'body',
      },
      defaultProps: {
        colorScheme: 'gold',
      },
      variants: {
        solid: {
          bg: 'brand.gold',
          color: 'brand.red',
          _hover: { bg: 'brand.goldDark', transform: 'scale(1.05)' },
          transition: 'background-color 0.3s ease, transform 0.3s ease',
        },
        outline: {
          borderColor: 'brand.gold',
          color: 'brand.gold',
          _hover: { bg: 'brand.gold', color: 'brand.red' },
        },
        ghost: {
          color: 'brand.gold',
          _hover: { bg: 'rgba(212,175,55,0.12)' },
        },
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            borderColor: 'brand.gold',
            color: 'brand.gold',
            bg: 'rgba(123,51,52,0.6)',
            _hover: { borderColor: 'brand.goldDark' },
            _focus: { borderColor: 'brand.gold', boxShadow: '0 0 0 1px #D4AF37' },
            _placeholder: { color: 'rgba(212,175,55,0.5)' },
          },
        },
      },
      defaultProps: { variant: 'outline' },
    },
    Textarea: {
      variants: {
        outline: {
          borderColor: 'brand.gold',
          color: 'brand.gold',
          bg: 'rgba(123,51,52,0.6)',
          _hover: { borderColor: 'brand.goldDark' },
          _focus: { borderColor: 'brand.gold', boxShadow: '0 0 0 1px #D4AF37' },
          _placeholder: { color: 'rgba(212,175,55,0.5)' },
        },
      },
      defaultProps: { variant: 'outline' },
    },
    Select: {
      variants: {
        outline: {
          field: {
            borderColor: 'brand.gold',
            color: 'brand.gold',
            bg: 'rgba(123,51,52,0.6)',
            _hover: { borderColor: 'brand.goldDark' },
            _focus: { borderColor: 'brand.gold', boxShadow: '0 0 0 1px #D4AF37' },
          },
          icon: { color: 'brand.gold' },
        },
      },
      defaultProps: { variant: 'outline' },
    },
    Badge: {
      baseStyle: {
        borderRadius: '4px',
        px: 2,
        py: 0.5,
        fontFamily: 'body',
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'rgba(84,56,37,0.7)',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          border: '1px solid rgba(212,175,55,0.3)',
          transition: 'box-shadow 0.3s ease',
          _hover: { boxShadow: '0 6px 20px rgba(0,0,0,0.3)' },
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          bg: 'brand.redDark',
          border: '1px solid rgba(212,175,55,0.4)',
        },
      },
    },
    Checkbox: {
      baseStyle: {
        control: {
          borderColor: 'brand.gold',
          _checked: { bg: 'brand.gold', borderColor: 'brand.gold', color: 'brand.red' },
        },
        label: { color: 'brand.gold' },
      },
    },
    FormLabel: {
      baseStyle: { color: 'brand.gold', fontFamily: 'body' },
    },
    Heading: {
      baseStyle: { color: 'brand.gold', fontFamily: 'heading' },
    },
    Text: {
      baseStyle: { color: 'brand.gold' },
    },
  },
});

export default theme;
