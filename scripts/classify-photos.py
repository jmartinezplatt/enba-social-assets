"""Apply Claude's visual classification to photo metadata and rebuild the preview HTML."""
import json
from pathlib import Path

OUT_DIR = Path("C:/Users/josea/enba-social-assets")
meta_path = OUT_DIR / "photo-metadata.json"

with open(meta_path) as f:
    photos = json.load(f)

print(f"Loaded {len(photos)} photos")

# Classification based on visual review of 34 contact sheets
# Each sheet has 50 photos, numbered 0-49 within the sheet
# Total index = sheet * 50 + position

classifications = {}

# Sheet 00 (0-49): marina/veleros amarrados, atardeceres, gente navegando, selfies, cartel rio de la plata
# Mix of veleros-broker, buenos-aires-paisaje, grupos-experiencia, travesias-navegacion
for i in range(0, 50):
    classifications[i] = "veleros-broker"  # default for sheet 0

# Override specifics from sheet 00
for i in [4,5,6,7,8,9,10,11,12,13]: classifications[i] = "veleros-broker"  # veleros en marina
for i in [22,23,36]: classifications[i] = "buenos-aires-paisaje"  # atardeceres
for i in [14,15,16,17,20,21,24,25,30,31,32,33,34,35,41,42,43,44]: classifications[i] = "travesias-navegacion"
for i in [26,27,28,29,37,38,39,40,45,46,47,48,49]: classifications[i] = "grupos-experiencia"
for i in [18,19]: classifications[i] = "buenos-aires-paisaje"

# Sheet 01 (50-99): marina, skyline BA, gente en cockpit, selfies navegando, chalecos
for i in range(50, 100):
    classifications[i] = "grupos-experiencia"
for i in [50,51,52,53,54,55,56,57]: classifications[i] = "veleros-broker"  # marina
for i in [58]: classifications[i] = "buenos-aires-paisaje"  # skyline
for i in [59,60,61,62,63,64,65]: classifications[i] = "grupos-experiencia"  # gente cockpit
for i in [66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81]: classifications[i] = "travesias-navegacion"
for i in [82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99]: classifications[i] = "grupos-experiencia"

# Sheet 02 (100-149): veleros en marina, selfies, gente en playa/arena, atardeceres
for i in range(100, 150):
    classifications[i] = "veleros-broker"
for i in [100,101,102,103,104,105,106,107,108,109,110,111,112]: classifications[i] = "veleros-broker"
for i in [113,114,115,116,117]: classifications[i] = "grupos-experiencia"  # selfies/gente
for i in [118,119,120,121,122,123,124,125]: classifications[i] = "veleros-broker"
for i in [126,127,128,129]: classifications[i] = "destinos"  # playa/arena
for i in [130,131,132,133,134]: classifications[i] = "veleros-broker"
for i in [135,136,137,138,139,140,141]: classifications[i] = "buenos-aires-paisaje"  # atardeceres/paisaje
for i in [142,143,144,145,146,147,148,149]: classifications[i] = "veleros-broker"

# Sheet 03 (150-199): destinos/playa, spinnaker colorido, gente navegando, selfies
for i in range(150, 200):
    classifications[i] = "travesias-navegacion"
for i in [150,151]: classifications[i] = "destinos"  # playa atardecer
for i in [152,153,154]: classifications[i] = "veleros-broker"
for i in [155]: classifications[i] = "travesias-navegacion"  # spinnaker
for i in [156,157,158,159]: classifications[i] = "grupos-experiencia"  # gente con chalecos
for i in [160,161,162,163,164,165,166]: classifications[i] = "grupos-experiencia"
for i in [167,168,169,170,171,172]: classifications[i] = "veleros-broker"
for i in [173,174,175,176,177,178,179,180,181]: classifications[i] = "grupos-experiencia"
for i in [182,183,184,185,186]: classifications[i] = "travesias-navegacion"
for i in [187,188,189]: classifications[i] = "veleros-broker"
for i in [190,191,192,193,194,195,196,197,198,199]: classifications[i] = "grupos-experiencia"

# Sheet 04 (200-249): gente navegando, chalecos, marina, selfies, atardeceres
for i in range(200, 250):
    classifications[i] = "grupos-experiencia"
for i in [200,201,202,203,204,205,206,207,208,209]: classifications[i] = "grupos-experiencia"
for i in [210,211]: classifications[i] = "veleros-broker"
for i in [212,213,214,215]: classifications[i] = "travesias-navegacion"
for i in [216,217,218,219,220]: classifications[i] = "grupos-experiencia"
for i in [221,222]: classifications[i] = "buenos-aires-paisaje"  # atardecer
for i in [223,224,225,226,227,228,229]: classifications[i] = "grupos-experiencia"
for i in [230,231,232,233,234,235]: classifications[i] = "veleros-broker"
for i in [236,237,238,239,240,241,242,243,244,245,246,247,248,249]: classifications[i] = "grupos-experiencia"

# Sheet 05 (250-299): gente con chalecos, marina, selfies, navegación
for i in range(250, 300):
    classifications[i] = "grupos-experiencia"
for i in [260,261,262,263,264,265]: classifications[i] = "veleros-broker"
for i in [270,271,272]: classifications[i] = "travesias-navegacion"
for i in [280,281,282,283,284,285]: classifications[i] = "veleros-broker"
for i in [290,291,292,293]: classifications[i] = "buenos-aires-paisaje"

# Sheet 06 (300-349): marina, veleros, gente en playa/agua caribe, destinos
for i in range(300, 350):
    classifications[i] = "veleros-broker"
for i in [300,301,302,303,304,305,306,307,308]: classifications[i] = "veleros-broker"
for i in [309]: classifications[i] = "grupos-experiencia"
for i in [310,311,312,313,314,315,316,317,318]: classifications[i] = "veleros-broker"
for i in [319,320,321]: classifications[i] = "buenos-aires-paisaje"
for i in [322,323,324,325,326,327]: classifications[i] = "veleros-broker"
for i in [328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349]: classifications[i] = "descartada"  # playa personal/caribe, no ENBA

# Sheet 07 (350-399): servicios/mantenimiento, gente navegando, selfies, atardeceres, delta
for i in range(350, 400):
    classifications[i] = "travesias-navegacion"
for i in [350,351,352,353,354]: classifications[i] = "buenos-aires-paisaje"  # atardecer
for i in [355,356,357]: classifications[i] = "servicios"
for i in [358,359,360,361,362,363]: classifications[i] = "veleros-broker"
for i in [364,365,366,367,368,369,370,371]: classifications[i] = "grupos-experiencia"
for i in [372,373,374]: classifications[i] = "buenos-aires-paisaje"  # atardecer marina
for i in [375,376,377,378,379,380]: classifications[i] = "veleros-broker"
for i in [381,382,383,384,385,386,387,388,389,390]: classifications[i] = "grupos-experiencia"
for i in [391,392,393,394,395,396,397,398,399]: classifications[i] = "travesias-navegacion"

# Sheet 08 (400-449): navegación, skyline BA, selfies, destinos, spinnaker
for i in range(400, 450):
    classifications[i] = "travesias-navegacion"
for i in [400,401,402,403,404,405,406]: classifications[i] = "travesias-navegacion"
for i in [407,408,409]: classifications[i] = "buenos-aires-paisaje"  # skyline
for i in [410,411,412,413,414,415,416,417]: classifications[i] = "grupos-experiencia"
for i in [418,419,420,421,422,423,424,425]: classifications[i] = "travesias-navegacion"
for i in [426,427,428,429,430,431,432,433,434,435,436,437,438,439]: classifications[i] = "grupos-experiencia"
for i in [440,441,442,443,444,445,446,447,448,449]: classifications[i] = "travesias-navegacion"

# Sheet 09 (450-499): veleros en marina, escuela/optimist en playa, chicos con velas
for i in range(450, 500):
    classifications[i] = "veleros-broker"
for i in [450,451,452,453,454,455,456,457,458,459,460,461]: classifications[i] = "veleros-broker"
for i in [462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]: classifications[i] = "escuela-aprendizaje"  # optimist/escuela en playa

# Sheet 10 (500-549): escuela optimist playa, gente en agua/playa, catamarán sponsor
for i in range(500, 550):
    classifications[i] = "escuela-aprendizaje"
for i in [500,501,502,503,504,505,506,507,508,509,510,511,512,513,514,515,516,517,518,519,520,521]: classifications[i] = "escuela-aprendizaje"  # escuela optimist con sponsor
for i in [522,523,524,525,526,527,528]: classifications[i] = "descartada"  # playa personal
for i in [529,530,531,532,533,534]: classifications[i] = "destinos"  # barco grande, montañas
for i in [535,536,537,538,539,540,541,542,543,544,545,546,547,548,549]: classifications[i] = "grupos-experiencia"

# Sheet 11 (550-599): marina, selfies, gente navegando, atardeceres
for i in range(550, 600):
    classifications[i] = "grupos-experiencia"
for i in [550,551,552,553,554,555]: classifications[i] = "grupos-experiencia"
for i in [556,557,558,559,560,561,562,563,564,565]: classifications[i] = "veleros-broker"
for i in [566,567,568,569,570,571,572,573,574,575]: classifications[i] = "grupos-experiencia"
for i in [576,577]: classifications[i] = "buenos-aires-paisaje"  # atardecer
for i in [578,579,580,581,582,583,584,585,586]: classifications[i] = "veleros-broker"
for i in [587,588,589,590,591,592,593,594,595,596,597,598,599]: classifications[i] = "grupos-experiencia"

# Sheet 12 (600-649): selfies, marina, veleros, spinnaker, gente en playa
for i in range(600, 650):
    classifications[i] = "veleros-broker"
for i in [600,601,602,603,604,605]: classifications[i] = "grupos-experiencia"
for i in [606,607,608,609,610]: classifications[i] = "travesias-navegacion"
for i in [611,612,613,614,615,616,617,618,619]: classifications[i] = "veleros-broker"
for i in [620,621,622,623]: classifications[i] = "travesias-navegacion"  # velero Picante navegando
for i in [624,625,626,627,628,629,630,631]: classifications[i] = "grupos-experiencia"
for i in [632,633,634,635,636,637,638,639,640,641,642,643,644,645,646,647,648,649]: classifications[i] = "veleros-broker"

# Sheet 13 (650-699): veleros en puerto, delfín, gente cockpit, navegación
for i in range(650, 700):
    classifications[i] = "veleros-broker"
for i in [650,651,652,653,654,655,656,657,658]: classifications[i] = "destinos"  # puerto/muelle con barcos grandes
for i in [659,660]: classifications[i] = "travesias-navegacion"  # delfín!
for i in [661,662,663,664,665,666,667,668]: classifications[i] = "grupos-experiencia"
for i in [669,670,671,672,673,674,675]: classifications[i] = "veleros-broker"
for i in [676,677,678,679,680,681,682,683,684]: classifications[i] = "travesias-navegacion"
for i in [685,686,687,688,689]: classifications[i] = "grupos-experiencia"
for i in [690,691,692,693,694,695,696,697,698,699]: classifications[i] = "veleros-broker"

# Sheet 14 (700-749): veleros en marina, interiores, detalles veleros (broker)
for i in range(700, 750):
    classifications[i] = "veleros-broker"

# Sheet 15 (750-799): veleros detalle, interiores madera, marina
for i in range(750, 800):
    classifications[i] = "veleros-broker"
for i in [790,791,792,793,794,795,796,797,798,799]: classifications[i] = "travesias-navegacion"  # navegando

# Sheet 16 (800-849): delta/río con vegetación, gente navegando, spinnaker
for i in range(800, 850):
    classifications[i] = "travesias-navegacion"
for i in [800,801,802,803]: classifications[i] = "destinos"  # delta/vegetación
for i in [804,805,806,807,808,809,810,811]: classifications[i] = "travesias-navegacion"
for i in [812,813,814,815,816,817,818,819,820,821,822,823,824,825,826,827,828,829]: classifications[i] = "grupos-experiencia"
for i in [830,831,832,833,834,835]: classifications[i] = "travesias-navegacion"  # spinnaker
for i in [836,837,838,839,840,841,842,843,844,845,846,847,848,849]: classifications[i] = "destinos"  # playa/olas

# Sheet 17 (850-899): veleros navegando, optimist, playa, atardeceres
for i in range(850, 900):
    classifications[i] = "travesias-navegacion"
for i in [850,851,852,853,854,855,856,857]: classifications[i] = "travesias-navegacion"
for i in [858,859,860,861,862,863,864,865,866,867,868,869]: classifications[i] = "veleros-broker"  # optimist/marina
for i in [870,871,872,873,874,875,876,877]: classifications[i] = "destinos"  # muelle/destino
for i in [878,879,880,881,882,883,884,885,886,887,888,889]: classifications[i] = "buenos-aires-paisaje"  # atardeceres playa
for i in [890,891,892,893,894,895,896,897,898,899]: classifications[i] = "buenos-aires-paisaje"

# Sheet 18 (900-949): atardeceres, castillo/fortaleza (destino), veleros, gente
for i in range(900, 950):
    classifications[i] = "buenos-aires-paisaje"
for i in [900,901,902,903,904,905,906,907,908,909]: classifications[i] = "buenos-aires-paisaje"  # atardeceres
for i in [910,911,912,913,914,915]: classifications[i] = "destinos"  # fortaleza/castillo, Colonia?
for i in [916,917,918,919]: classifications[i] = "destinos"
for i in [920,921,922,923,924,925,926,927,928,929,930]: classifications[i] = "travesias-navegacion"
for i in [931,932,933,934,935,936,937,938,939]: classifications[i] = "grupos-experiencia"
for i in [940,941,942,943,944,945,946,947,948,949]: classifications[i] = "travesias-navegacion"

# Sheet 19 (950-999): destinos tropicales, cartel navegación, grupos, atardeceres
for i in range(950, 1000):
    classifications[i] = "travesias-navegacion"
for i in [950,951,952,953,954,955,956,957,958]: classifications[i] = "destinos"  # tropical/caribe
for i in [959,960,961]: classifications[i] = "buenos-aires-paisaje"  # atardecer
for i in [962,963]: classifications[i] = "descartada"  # cartel/publicidad ajena
for i in [964,965,966]: classifications[i] = "escuela-aprendizaje"  # cartel escuela
for i in [967,968,969,970]: classifications[i] = "veleros-broker"
for i in [971,972,973,974,975,976,977,978]: classifications[i] = "grupos-experiencia"
for i in [979,980,981,982,983,984]: classifications[i] = "travesias-navegacion"
for i in [985,986,987,988,989,990,991,992,993,994,995,996,997,998,999]: classifications[i] = "grupos-experiencia"

# Sheet 20 (1000-1049): gente cockpit atardecer, navegando, vela
for i in range(1000, 1050):
    classifications[i] = "grupos-experiencia"
for i in [1000,1001,1002,1003,1004,1005,1006,1007,1008,1009,1010,1011,1012,1013]: classifications[i] = "grupos-experiencia"  # atardecer cockpit
for i in [1014,1015,1016,1017,1018,1019,1020]: classifications[i] = "travesias-navegacion"
for i in [1021,1022,1023,1024,1025,1026,1027,1028,1029,1030]: classifications[i] = "veleros-broker"
for i in [1031,1032,1033,1034,1035,1036,1037,1038,1039,1040,1041,1042,1043,1044,1045,1046,1047,1048,1049]: classifications[i] = "grupos-experiencia"

# Sheet 21 (1050-1099): marina, atardeceres, gente navegando
for i in range(1050, 1100):
    classifications[i] = "travesias-navegacion"
for i in [1050,1051,1052,1053,1054,1055]: classifications[i] = "veleros-broker"
for i in [1056,1057,1058,1059,1060,1061,1062,1063,1064,1065]: classifications[i] = "buenos-aires-paisaje"  # atardeceres
for i in [1066,1067,1068,1069,1070,1071,1072,1073,1074,1075]: classifications[i] = "travesias-navegacion"
for i in [1076,1077,1078,1079,1080,1081,1082,1083,1084,1085,1086,1087,1088,1089]: classifications[i] = "grupos-experiencia"
for i in [1090,1091,1092,1093,1094,1095,1096,1097,1098,1099]: classifications[i] = "travesias-navegacion"

# Sheet 22 (1100-1149): navegación, atardecer, marina, maniobras
for i in range(1100, 1150):
    classifications[i] = "travesias-navegacion"
for i in [1100,1101,1102,1103,1104,1105,1106,1107]: classifications[i] = "travesias-navegacion"
for i in [1108,1109,1110,1111]: classifications[i] = "buenos-aires-paisaje"  # atardecer
for i in [1112,1113,1114,1115,1116,1117,1118,1119,1120]: classifications[i] = "escuela-aprendizaje"  # maniobras grupo grande
for i in [1121,1122,1123,1124,1125,1126,1127,1128,1129]: classifications[i] = "veleros-broker"  # veleros en marina
for i in [1130,1131,1132,1133,1134,1135,1136,1137,1138,1139,1140,1141,1142,1143,1144,1145]: classifications[i] = "veleros-broker"
for i in [1146,1147,1148,1149]: classifications[i] = "travesias-navegacion"

# Sheet 23 (1150-1199): veleros marina, cartel alquiler, gente con minions, velas
for i in range(1150, 1200):
    classifications[i] = "veleros-broker"
for i in [1150,1151,1152,1153,1154,1155,1156,1157,1158,1159,1160]: classifications[i] = "veleros-broker"
for i in [1161]: classifications[i] = "descartada"  # cartel alquiler ajeno
for i in [1162,1163,1164,1165,1166,1167,1168,1169,1170,1171,1172,1173,1174,1175]: classifications[i] = "descartada"  # fotos con minions/personales
for i in [1176,1177,1178,1179,1180,1181,1182,1183,1184,1185,1186,1187,1188,1189,1190,1191,1192,1193,1194,1195,1196,1197,1198,1199]: classifications[i] = "veleros-broker"

# Sheet 24 (1200-1249): marina, gente navegando, rayas en camisa, atardeceres
for i in range(1200, 1250):
    classifications[i] = "grupos-experiencia"
for i in [1200,1201,1202,1203,1204,1205,1206,1207]: classifications[i] = "veleros-broker"
for i in [1208,1209,1210,1211,1212,1213,1214,1215,1216,1217,1218,1219,1220,1221,1222,1223,1224,1225]: classifications[i] = "grupos-experiencia"
for i in [1226,1227,1228,1229,1230,1231,1232,1233,1234]: classifications[i] = "travesias-navegacion"
for i in [1235,1236,1237,1238,1239,1240,1241,1242,1243,1244,1245,1246,1247,1248,1249]: classifications[i] = "buenos-aires-paisaje"  # atardeceres

# Sheet 25 (1250-1299): navegación nocturna, atardecer, grupo cockpit, gente en agua
for i in range(1250, 1300):
    classifications[i] = "travesias-navegacion"
for i in [1250,1251,1252,1253,1254,1255,1256,1257,1258,1259]: classifications[i] = "travesias-navegacion"  # nocturna
for i in [1260,1261,1262,1263,1264,1265,1266,1267,1268,1269]: classifications[i] = "buenos-aires-paisaje"  # atardecer
for i in [1270,1271,1272,1273,1274,1275,1276,1277,1278,1279]: classifications[i] = "grupos-experiencia"
for i in [1280,1281,1282,1283]: classifications[i] = "travesias-navegacion"
for i in [1284,1285,1286,1287,1288,1289]: classifications[i] = "destinos"  # fondeados
for i in [1290,1291,1292,1293,1294,1295,1296,1297,1298,1299]: classifications[i] = "descartada"  # gente en agua personal

# Sheet 26 (1300-1349): gente navegando, velas, cockpit
for i in range(1300, 1350):
    classifications[i] = "travesias-navegacion"
for i in [1300,1301,1302,1303,1304,1305,1306,1307,1308,1309]: classifications[i] = "grupos-experiencia"
for i in [1310,1311,1312,1313,1314,1315,1316,1317,1318,1319]: classifications[i] = "travesias-navegacion"
for i in [1320,1321,1322,1323,1324,1325,1326,1327,1328,1329,1330]: classifications[i] = "veleros-broker"
for i in [1331,1332,1333,1334,1335,1336,1337,1338,1339,1340,1341,1342,1343,1344,1345,1346,1347,1348,1349]: classifications[i] = "travesias-navegacion"

# Sheet 27 (1350-1399): navegación, año nuevo, velero en agua, playa personal
for i in range(1350, 1400):
    classifications[i] = "travesias-navegacion"
for i in [1350,1351,1352,1353,1354,1355,1356,1357,1358,1359,1360,1361,1362,1363,1364]: classifications[i] = "travesias-navegacion"
for i in [1365]: classifications[i] = "descartada"  # año nuevo personal
for i in [1366,1367,1368,1369,1370]: classifications[i] = "travesias-navegacion"  # velero navegando
for i in [1371,1372]: classifications[i] = "grupos-experiencia"
for i in [1373,1374,1375]: classifications[i] = "veleros-broker"
for i in [1376,1377,1378,1379,1380,1381,1382,1383,1384,1385,1386,1387,1388,1389,1390,1391,1392,1393,1394,1395,1396,1397,1398,1399]: classifications[i] = "descartada"  # playa personal/caribe

# Sheet 28 (1400-1449): playa personal, agua caribe — descartada en su mayoría
for i in range(1400, 1450):
    classifications[i] = "descartada"  # playa personal
for i in [1430,1431,1432,1433,1434,1435,1436,1437,1438,1439,1440,1441,1442,1443,1444,1445,1446,1447,1448,1449]: classifications[i] = "descartada"
# Algunos veleros navegando en el medio
for i in [1420,1421,1422,1423,1424,1425,1426,1427,1428,1429]: classifications[i] = "travesias-navegacion"

# Sheet 29 (1450-1499): gente playa/agua, marina, servicios
for i in range(1450, 1500):
    classifications[i] = "veleros-broker"
for i in [1450,1451,1452,1453,1454,1455,1456,1457]: classifications[i] = "descartada"  # playa personal
for i in [1458,1459,1460,1461,1462,1463,1464,1465,1466,1467,1468,1469,1470]: classifications[i] = "veleros-broker"
for i in [1471,1472,1473,1474,1475,1476,1477,1478,1479]: classifications[i] = "servicios"
for i in [1480,1481,1482,1483,1484,1485,1486,1487,1488,1489,1490,1491,1492,1493,1494,1495,1496,1497,1498,1499]: classifications[i] = "veleros-broker"

# Sheet 30 (1500-1549): fragata/barco escuela grande, BA skyline
for i in range(1500, 1550):
    classifications[i] = "buenos-aires-paisaje"
for i in [1500,1501,1502,1503,1504,1505,1506,1507,1508,1509,1510,1511,1512,1513,1514,1515,1516,1517,1518,1519,1520,1521,1522,1523,1524,1525,1526,1527,1528,1529,1530,1531,1532,1533,1534,1535,1536,1537,1538,1539,1540,1541,1542,1543,1544]: classifications[i] = "buenos-aires-paisaje"  # fragata + skyline BA
for i in [1545,1546,1547,1548,1549]: classifications[i] = "destinos"  # lago/montaña

# Sheet 31 (1550-1599): destinos, marina, gente navegando atardecer, perros
for i in range(1550, 1600):
    classifications[i] = "travesias-navegacion"
for i in [1550,1551,1552,1553,1554,1555]: classifications[i] = "destinos"
for i in [1556,1557,1558,1559,1560]: classifications[i] = "travesias-navegacion"
for i in [1561,1562,1563,1564,1565]: classifications[i] = "grupos-experiencia"
for i in [1566,1567]: classifications[i] = "buenos-aires-paisaje"  # atardecer
for i in [1568,1569,1570,1571,1572,1573,1574,1575]: classifications[i] = "buenos-aires-paisaje"  # atardecer cockpit
for i in [1576,1577,1578,1579,1580,1581,1582,1583,1584]: classifications[i] = "destinos"  # montaña/lago/sur
for i in [1585,1586,1587,1588,1589]: classifications[i] = "descartada"  # perros/personal
for i in [1590,1591,1592,1593,1594,1595,1596,1597,1598,1599]: classifications[i] = "veleros-broker"

# Sheet 32 (1600-1649): servicios/mantenimiento, veleros marina, navegando
for i in range(1600, 1650):
    classifications[i] = "veleros-broker"
for i in [1600,1601,1602,1603,1604,1605,1606,1607]: classifications[i] = "servicios"
for i in [1608,1609,1610,1611,1612,1613,1614,1615,1616,1617,1618,1619,1620,1621,1622,1623,1624,1625,1626,1627,1628,1629,1630,1631,1632,1633,1634,1635,1636,1637,1638,1639,1640,1641,1642,1643,1644,1645,1646,1647,1648,1649]: classifications[i] = "veleros-broker"

# Sheet 33 (1650-1654): últimos veleros
for i in range(1650, 1655):
    classifications[i] = "veleros-broker"

# Apply to photos
for p in photos:
    idx = p["idx"]
    if idx in classifications:
        p["category"] = classifications[idx]
    else:
        p["category"] = "descartada"

# Stats
from collections import Counter
cats = Counter(p["category"] for p in photos)
print("\nClassification results:")
for cat, count in cats.most_common():
    print(f"  {cat}: {count}")

# Save classified metadata
with open(meta_path, "w") as f:
    json.dump(photos, f, indent=2)
print(f"\nSaved to {meta_path}")

# Also save as simple classification dict for the preview HTML
class_dict = {str(p["idx"]): p["category"] for p in photos}
with open(OUT_DIR / "photo-classifications.json", "w") as f:
    json.dump(class_dict, f)
print("Saved photo-classifications.json")
