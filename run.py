#!/usr/bin/env python3
"""
Script para executar o servidor Flask
"""

import sys
import os

# Adicionar o diretório src ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# Importar e executar o app
from src.main import app

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000, debug=True)