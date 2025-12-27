import requests
import pandas as pd
import numpy as np
import enum
from dotenv import load_dotenv
import os
import datetime

load_dotenv()

# Settings
PAIRS = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD']

API_URI = os.getenv('FAST_FOREX_API_URI')
API_KEY = os.getenv('FAST_FOREX_API_KEY')

GLOBAL_CURRENCIES = [
      "AED","AFN","ALL","AMD","ANG","AOA","ARS","AUD","AWG","AZN",
      "BAM","BBD","BDT","BGN","BHD","BIF","BMD","BND","BOB","BRL",
      "BRX","BSD","BWP","BYN","BZD","CAD","CDF","CHF","CLF","CLP",
      "CNH","CNY","COP","COU","CRC","CUP","CVE","CZK","DJF","DKK",
      "DOP","DZD","EGP","ERN","ETB","EUR","FJD","FKP","GBP","GEL",
      "GHS","GIP","GMD","GNF","GTQ","GYD","HKD","HNL","HTG","HUF",
      "HUX","IDR","ILS","INR","IQD","IRR","ISK","JMD","JOD","JPY",
      "KES","KGS","KHR","KMF","KPW","KRW","KWD","KYD","KZT","LAK",
      "LBP","LKR","LRD","LSL","LYD","MAD","MDL","MGA","MKD","MMK",
      "MNT","MOP","MRU","MUR","MVR","MWK","MXN","MXV","MYR","MZN",
      "NAD","NGN","NIO","NOK","NPR","NZD","OMR","PAB","PEN","PGK",
      "PHP","PKR","PLN","PYG","QAR","RON","RSD","RUB","RWF","SAR",
      "SBD","SCR","SDG","SEK","SGD","SHP","SLL","SOS","SRD","SSP",
      "STN","SVC","SYP","SZL","THB","TJS","TMT","TND","TOP","TRY",
      "TTD","TWD","TZS","UAH","UGX","USD","UYU","UZS","VES","VND",
      "VUV","WST","XAF","XCD","XDR","XOF","XPF","YER","ZAR","ZMW"
]

GLOBAL_CRYPTO_CURRENCIES = [
      "AED","AFN","ALL","AMD","ANG","AOA","ARS","AUD","AWG","AZN",
      "BAM","BBD","BDT","BGN","BHD","BIF","BMD","BND","BOB","BRL",
      "BRX","BSD","BWP","BYN","BZD","CAD","CDF","CHF","CLF","CLP",
      "CNH","CNY","COP","COU","CRC","CUP","CVE","CZK","DJF","DKK",
      "DOP","DZD","EGP","ERN","ETB","EUR","FJD","FKP","GBP","GEL",
      "GHS","GIP","GMD","GNF","GTQ","GYD","HKD","HNL","HTG","HUF",
      "HUX","IDR","ILS","INR","IQD","IRR","ISK","JMD","JOD","JPY",
      "KES","KGS","KHR","KMF","KPW","KRW","KWD","KYD","KZT","LAK",
      "LBP","LKR","LRD","LSL","LYD","MAD","MDL","MGA","MKD","MMK",
      "MNT","MOP","MRU","MUR","MVR","MWK","MXN","MXV","MYR","MZN",
      "NAD","NGN","NIO","NOK","NPR","NZD","OMR","PAB","PEN","PGK",
      "PHP","PKR","PLN","PYG","QAR","RON","RSD","RUB","RWF","SAR",
      "SBD","SCR","SDG","SEK","SGD","SHP","SLL","SOS","SRD","SSP",
      "STN","SVC","SYP","SZL","THB","TJS","TMT","TND","TOP","TRY",
      "TTD","TWD","TZS","UAH","UGX","USD","UYU","UZS","VES","VND",
      "VUV","WST","XAF","XCD","XDR","XOF","XPF","YER","ZAR","ZMW"
]

class BaseSettings(enum.Enum):
      EMA_FAST = 9
      EMA_SLOW = 21
      RSI_PERIOD = 14
      MACD_FAST = 12
      MACD_SLOW = 26
      MACD_SIGNAL = 9
      
      
class Endpoints(enum.Enum):
      FETCH_ALL = '/fetch-all'
      FETCH_ONE = '/fetch-one'
      FETCH_MULTI = '/fetch-multi'
      FETCH_MANY_TO_ONE = '/fetch-many-to-one'
      FETCH_MATRIX = '/fetch-matrix'
      HISTORICAL = '/historical'
      TIME_SERIES = '/time-series'
      CURRENCIES = '/currencies'
      CONVERT = '/convert'


class LiveRates:
      
      def __validate_currency(self, currency: str) -> bool:
            if not isinstance(currency, str):
                  return False
            
            if len(currency) > 3 or len(currency) < 3:
                  return False
            
            upper_case_currency = currency.upper()
            
            if upper_case_currency in GLOBAL_CURRENCIES or upper_case_currency in GLOBAL_CRYPTO_CURRENCIES:
                  return True
            
      
      def fetch_all(self, currency: str):
            pass

      def fetch_one(self, currency: str, target_currency: str):
            pass
      
      def fetch_mult(self, currency: str, target_currencies: list[str]):
            pass
      
      def fetch_many_to_one(self, currencies: list[str], currency: str):
            pass

      def fetch_historical(self, currency: str, target_currency: str, period: str):
            pass

      def fetch_matrix(self, currencies: list[str], target_currencies: list[str]):
            pass
      
      def convert(self, currency: str, target_currency: str, amount: float, precision: int):
            pass
      
      def time_series(self, currency: str, target_currency: str, start: datetime.date, end: datetime.date, interval: str):
            pass
      
      def currencies(self):
            pass
      
      def pairs(self):
            pass
      
      def crypto_currencies(self):
            pass
      
      

class Signals:
      def __init__(self):
            pass


      def fetch_live_rate(self, pair: list):
            pass


