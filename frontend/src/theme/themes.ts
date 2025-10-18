import { createTheme, ThemeOptions } from '@mui/material/styles'

export interface AppTheme {
  id: string
  name: string
  preview: {
    primary: string
    secondary: string
    background: string
  }
  theme: ThemeOptions
}

// Ocean Blue Theme
const oceanBlue: AppTheme = {
  id: 'ocean-blue',
  name: 'Ocean Blue',
  preview: {
    primary: '#0077be',
    secondary: '#00a8cc',
    background: '#f0f8ff'
  },
  theme: {
    palette: {
      mode: 'light',
      primary: {
        main: '#0077be',
        light: '#3da5d9',
        dark: '#005082'
      },
      secondary: {
        main: '#00a8cc',
        light: '#4fd1c5',
        dark: '#007a99'
      },
      background: {
        default: '#f0f8ff',
        paper: '#ffffff'
      }
    }
  }
}

// Forest Green Theme
const forestGreen: AppTheme = {
  id: 'forest-green',
  name: 'Forest Green',
  preview: {
    primary: '#2d6a4f',
    secondary: '#52b788',
    background: '#f1faee'
  },
  theme: {
    palette: {
      mode: 'light',
      primary: {
        main: '#2d6a4f',
        light: '#52b788',
        dark: '#1b4332'
      },
      secondary: {
        main: '#52b788',
        light: '#95d5b2',
        dark: '#40916c'
      },
      background: {
        default: '#f1faee',
        paper: '#ffffff'
      }
    }
  }
}

// Sunset Orange Theme
const sunsetOrange: AppTheme = {
  id: 'sunset-orange',
  name: 'Sunset Orange',
  preview: {
    primary: '#ff6b35',
    secondary: '#f7931e',
    background: '#fff8f0'
  },
  theme: {
    palette: {
      mode: 'light',
      primary: {
        main: '#ff6b35',
        light: '#ff8c5f',
        dark: '#d94e1f'
      },
      secondary: {
        main: '#f7931e',
        light: '#ffb347',
        dark: '#cc7700'
      },
      background: {
        default: '#fff8f0',
        paper: '#ffffff'
      }
    }
  }
}

// Midnight Purple Theme
const midnightPurple: AppTheme = {
  id: 'midnight-purple',
  name: 'Midnight Purple',
  preview: {
    primary: '#7209b7',
    secondary: '#b5179e',
    background: '#faf5ff'
  },
  theme: {
    palette: {
      mode: 'light',
      primary: {
        main: '#7209b7',
        light: '#9d4edd',
        dark: '#560bad'
      },
      secondary: {
        main: '#b5179e',
        light: '#c77dff',
        dark: '#9d0087'
      },
      background: {
        default: '#faf5ff',
        paper: '#ffffff'
      }
    }
  }
}

// Default (Current) Theme
const defaultTheme: AppTheme = {
  id: 'default',
  name: 'Default',
  preview: {
    primary: '#667eea',
    secondary: '#764ba2',
    background: '#ffffff'
  },
  theme: {
    palette: {
      mode: 'light',
      primary: {
        main: '#667eea',
        light: '#8b9fe8',
        dark: '#4c5fcf'
      },
      secondary: {
        main: '#764ba2',
        light: '#9b6cbd',
        dark: '#5a3778'
      },
      background: {
        default: '#ffffff',
        paper: '#fafafa'
      }
    }
  }
}

// Dark Theme
const darkTheme: AppTheme = {
  id: 'dark',
  name: 'Dark Mode',
  preview: {
    primary: '#667eea',
    secondary: '#764ba2',
    background: '#121212'
  },
  theme: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#8b9fe8',
        light: '#a5b5f0',
        dark: '#667eea'
      },
      secondary: {
        main: '#9b6cbd',
        light: '#b187d1',
        dark: '#764ba2'
      },
      background: {
        default: '#121212',
        paper: '#1e1e1e'
      }
    }
  }
}

// Rose Gold Theme
const roseGold: AppTheme = {
  id: 'rose-gold',
  name: 'Rose Gold',
  preview: {
    primary: '#c77dff',
    secondary: '#e0aaff',
    background: '#fff5f7'
  },
  theme: {
    palette: {
      mode: 'light',
      primary: {
        main: '#c77dff',
        light: '#e0aaff',
        dark: '#9d4edd'
      },
      secondary: {
        main: '#e0aaff',
        light: '#ffc6ff',
        dark: '#c77dff'
      },
      background: {
        default: '#fff5f7',
        paper: '#ffffff'
      }
    }
  }
}

// Cyberpunk Theme
const cyberpunk: AppTheme = {
  id: 'cyberpunk',
  name: 'Cyberpunk',
  preview: {
    primary: '#00f5ff',
    secondary: '#ff00ff',
    background: '#0a0e27'
  },
  theme: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#00f5ff',
        light: '#5ffbff',
        dark: '#00c8d4'
      },
      secondary: {
        main: '#ff00ff',
        light: '#ff5cff',
        dark: '#cc00cc'
      },
      background: {
        default: '#0a0e27',
        paper: '#1a1f3a'
      }
    }
  }
}

// Mint Fresh Theme
const mintFresh: AppTheme = {
  id: 'mint-fresh',
  name: 'Mint Fresh',
  preview: {
    primary: '#06d6a0',
    secondary: '#118ab2',
    background: '#f0fff4'
  },
  theme: {
    palette: {
      mode: 'light',
      primary: {
        main: '#06d6a0',
        light: '#5ee7c5',
        dark: '#05ab80'
      },
      secondary: {
        main: '#118ab2',
        light: '#4ea8c5',
        dark: '#0d6d8f'
      },
      background: {
        default: '#f0fff4',
        paper: '#ffffff'
      }
    }
  }
}

// Coffee Theme
const coffee: AppTheme = {
  id: 'coffee',
  name: 'Coffee',
  preview: {
    primary: '#6f4e37',
    secondary: '#a0826d',
    background: '#faf7f2'
  },
  theme: {
    palette: {
      mode: 'light',
      primary: {
        main: '#6f4e37',
        light: '#8b6549',
        dark: '#583e2c'
      },
      secondary: {
        main: '#a0826d',
        light: '#c9a88a',
        dark: '#806857'
      },
      background: {
        default: '#faf7f2',
        paper: '#ffffff'
      }
    }
  }
}

// Northern Lights Theme
const northernLights: AppTheme = {
  id: 'northern-lights',
  name: 'Northern Lights',
  preview: {
    primary: '#4cc9f0',
    secondary: '#7209b7',
    background: '#f0f3ff'
  },
  theme: {
    palette: {
      mode: 'light',
      primary: {
        main: '#4cc9f0',
        light: '#80d9f5',
        dark: '#3da1c0'
      },
      secondary: {
        main: '#7209b7',
        light: '#9d4edd',
        dark: '#560bad'
      },
      background: {
        default: '#f0f3ff',
        paper: '#ffffff'
      }
    }
  }
}

export const availableThemes: AppTheme[] = [
  defaultTheme,
  darkTheme,
  oceanBlue,
  forestGreen,
  sunsetOrange,
  midnightPurple,
  roseGold,
  cyberpunk,
  mintFresh,
  coffee,
  northernLights
]

export const getThemeById = (id: string): AppTheme => {
  return availableThemes.find(t => t.id === id) || defaultTheme
}

export const createAppTheme = (themeId: string) => {
  const appTheme = getThemeById(themeId)
  return createTheme(appTheme.theme)
}
