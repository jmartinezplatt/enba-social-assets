"""Apply classification to videos based on visual review of contact sheets."""
import json
from pathlib import Path

OUT_DIR = Path("C:/Users/josea/enba-social-assets")

classifications = {}

# Sheet 00 (0-49): destinos, marina, selfies navegando, veleros, gente cockpit
for i in range(0, 50):
    classifications[i] = "travesias-navegacion"
for i in [0,1]: classifications[i] = "destinos"  # puerto/aéreo
for i in [2,3]: classifications[i] = "travesias-navegacion"
for i in [4,5,6,7]: classifications[i] = "grupos-experiencia"  # selfies
for i in [8,9,10,11,12,13,14]: classifications[i] = "veleros-broker"
for i in [15,16]: classifications[i] = "grupos-experiencia"
for i in [17,18]: classifications[i] = "descartada"  # oscuro/borroso
for i in [19,20,21,22,23,24,25]: classifications[i] = "veleros-broker"  # marina
for i in [26,27,28,29,30]: classifications[i] = "travesias-navegacion"
for i in [31,32,33,34,35]: classifications[i] = "veleros-broker"
for i in [36,37,38,39,40,41,42,43,44,45,46,47,48,49]: classifications[i] = "travesias-navegacion"

# Sheet 01 (50-99): gente playa, flyer luna llena, marina, veleros, servicios
for i in range(50, 100):
    classifications[i] = "veleros-broker"
for i in [50,51,52,53,54]: classifications[i] = "grupos-experiencia"
for i in [55,56,57,58,59,60]: classifications[i] = "travesias-navegacion"
for i in [61]: classifications[i] = "descartada"  # flyer
for i in [62,63,64,65,66]: classifications[i] = "travesias-navegacion"
for i in [67,68,69,70,71,72,73,74]: classifications[i] = "veleros-broker"
for i in [75,76,77,78,79,80,81,82,83]: classifications[i] = "travesias-navegacion"
for i in [84,85,86,87,88]: classifications[i] = "servicios"
for i in [89,90,91,92,93,94,95,96,97,98,99]: classifications[i] = "veleros-broker"

# Sheet 02 (100-149): veleros, atardeceres, navegación, vela
for i in range(100, 150):
    classifications[i] = "travesias-navegacion"
for i in [100,101,102,103]: classifications[i] = "veleros-broker"
for i in [104,105]: classifications[i] = "buenos-aires-paisaje"  # atardecer
for i in [106,107,108,109,110]: classifications[i] = "veleros-broker"
for i in [111,112,113,114,115,116,117,118,119,120]: classifications[i] = "travesias-navegacion"
for i in [121,122,123,124]: classifications[i] = "destinos"  # playa/arena
for i in [125,126,127,128,129,130,131,132,133]: classifications[i] = "travesias-navegacion"
for i in [134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149]: classifications[i] = "travesias-navegacion"

# Sheet 03 (150-199): navegación, marina, veleros Picante, selfies, atardecer
for i in range(150, 200):
    classifications[i] = "veleros-broker"
for i in [150,151,152,153,154,155,156]: classifications[i] = "travesias-navegacion"
for i in [157,158,159,160,161]: classifications[i] = "veleros-broker"  # marina
for i in [162,163]: classifications[i] = "buenos-aires-paisaje"  # atardecer
for i in [164,165,166,167]: classifications[i] = "grupos-experiencia"
for i in [168,169,170,171,172,173]: classifications[i] = "travesias-navegacion"
for i in [174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199]: classifications[i] = "veleros-broker"

# Sheet 04 (200-249): destinos caribe, gente playa, veleros navegando, escuela, atardecer
for i in range(200, 250):
    classifications[i] = "travesias-navegacion"
for i in [200,201,202,203,204,205]: classifications[i] = "descartada"  # caribe personal
for i in [206,207,208,209,210]: classifications[i] = "grupos-experiencia"
for i in [211,212,213,214,215,216,217,218]: classifications[i] = "travesias-navegacion"  # veleros navegando
for i in [219,220,221,222,223,224]: classifications[i] = "escuela-aprendizaje"  # maniobras
for i in [225,226,227,228]: classifications[i] = "buenos-aires-paisaje"  # atardecer
for i in [229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249]: classifications[i] = "veleros-broker"

# Sheet 05 (250-299): veleros detalle/interior, marina, navegando
for i in range(250, 300):
    classifications[i] = "veleros-broker"
for i in [290,291,292,293,294,295,296,297,298,299]: classifications[i] = "travesias-navegacion"

# Sheet 06 (300-349): delta/vegetación, gente cockpit, veleros, maniobras
for i in range(300, 350):
    classifications[i] = "travesias-navegacion"
for i in [300,301,302,303,304,305,306]: classifications[i] = "destinos"  # delta con vegetación
for i in [307,308,309]: classifications[i] = "veleros-broker"
for i in [310,311,312,313,314,315,316]: classifications[i] = "grupos-experiencia"  # gente cockpit
for i in [317,318,319,320]: classifications[i] = "veleros-broker"
for i in [321,322,323,324,325,326,327,328,329]: classifications[i] = "travesias-navegacion"  # maniobras vela
for i in [330,331,332,333,334,335]: classifications[i] = "buenos-aires-paisaje"  # atardecer marina
for i in [336,337,338,339,340,341,342,343,344,345,346,347,348,349]: classifications[i] = "veleros-broker"

# Sheet 07 (350-399): navegación, playa/muelle destino, atardeceres playa, caribe
for i in range(350, 400):
    classifications[i] = "travesias-navegacion"
for i in [350,351,352,353]: classifications[i] = "grupos-experiencia"
for i in [354,355,356,357,358,359,360,361,362,363]: classifications[i] = "destinos"  # playa/muelle/olas
for i in [364,365,366,367,368,369,370,371,372,373,374,375,376,377,378,379]: classifications[i] = "buenos-aires-paisaje"  # atardeceres
for i in [380,381,382,383,384,385,386,387,388,389]: classifications[i] = "travesias-navegacion"  # veleros al atardecer
for i in [390,391,392,393,394,395,396,397,398,399]: classifications[i] = "descartada"  # caribe/fortaleza personal

# Sheet 08 (400-449): destinos caribe/agua turquesa, marina, gente navegando
for i in range(400, 450):
    classifications[i] = "destinos"
for i in [400,401,402,403,404,405,406,407]: classifications[i] = "destinos"  # caribe/isla
for i in [408,409,410,411,412,413]: classifications[i] = "veleros-broker"  # marina IANYI
for i in [414,415,416,417,418,419,420,421,422,423]: classifications[i] = "travesias-navegacion"  # maniobras vela
for i in [424,425,426,427,428,429]: classifications[i] = "descartada"  # playa personal caribe
for i in [430,431,432,433,434,435,436,437]: classifications[i] = "grupos-experiencia"  # gente cockpit atardecer
for i in [438,439,440,441,442,443,444,445,446,447,448,449]: classifications[i] = "travesias-navegacion"

# Sheet 09 (450-499): servicios/mantenimiento, grupos, atardeceres, navegación
for i in range(450, 500):
    classifications[i] = "grupos-experiencia"
for i in [450,451,452]: classifications[i] = "servicios"  # trailer/mantenimiento
for i in [453,454,455,456,457,458,459]: classifications[i] = "grupos-experiencia"  # grupo amigos
for i in [460,461,462,463,464,465,466,467,468,469,470,471]: classifications[i] = "travesias-navegacion"  # navegación atardecer
for i in [472,473,474,475,476,477,478,479,480,481,482,483]: classifications[i] = "grupos-experiencia"  # cockpit atardecer
for i in [484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499]: classifications[i] = "grupos-experiencia"

# Sheet 10 (500-549): fotos album/print, marina, selfies, vela, atardeceres
for i in range(500, 550):
    classifications[i] = "travesias-navegacion"
for i in [500]: classifications[i] = "descartada"  # foto impresa
for i in [501,502,503,504,505,506]: classifications[i] = "buenos-aires-paisaje"  # atardecer
for i in [507,508,509,510,511]: classifications[i] = "veleros-broker"
for i in [512,513,514,515,516,517,518,519]: classifications[i] = "grupos-experiencia"
for i in [520,521,522,523,524,525,526,527,528,529,530]: classifications[i] = "travesias-navegacion"  # navegación/vela
for i in [531,532,533,534,535,536,537,538,539,540]: classifications[i] = "veleros-broker"  # marina
for i in [541,542,543,544,545,546,547,548,549]: classifications[i] = "travesias-navegacion"

# Sheet 11 (550-599): gente cockpit, navegación, marina, selfies
for i in range(550, 600):
    classifications[i] = "grupos-experiencia"
for i in [550,551,552,553,554,555,556,557,558,559]: classifications[i] = "grupos-experiencia"
for i in [560,561,562,563,564,565,566,567,568,569,570,571,572,573,574,575]: classifications[i] = "travesias-navegacion"
for i in [576,577,578,579,580,581,582,583,584,585,586,587,588,589]: classifications[i] = "veleros-broker"  # marina
for i in [590,591,592,593,594,595,596,597,598,599]: classifications[i] = "grupos-experiencia"

# Sheet 12 (600-649): navegación con escora, playa caribe, selfie pareja, playa personal
for i in range(600, 650):
    classifications[i] = "travesias-navegacion"
for i in [600,601,602,603,604,605,606,607,608,609,610,611,612]: classifications[i] = "travesias-navegacion"  # navegación dinámica
for i in [613,614,615,616,617,618]: classifications[i] = "descartada"  # agua turquesa/caribe personal
for i in [619,620]: classifications[i] = "grupos-experiencia"  # pareja
for i in [621,622,623,624,625,626,627,628,629,630,631,632,633]: classifications[i] = "descartada"  # playa personal
for i in [634,635,636,637,638,639,640,641,642,643,644,645,646,647,648,649]: classifications[i] = "travesias-navegacion"

# Sheet 13 (650-699): veleros navegando, marina, playa personal, regata
for i in range(650, 700):
    classifications[i] = "travesias-navegacion"
for i in [650,651,652,653,654,655,656,657,658,659]: classifications[i] = "travesias-navegacion"  # regata/veleros
for i in [660,661,662,663,664,665,666,667]: classifications[i] = "veleros-broker"  # marina
for i in [668,669,670,671,672,673]: classifications[i] = "descartada"  # playa personal
for i in [674,675,676,677,678,679,680]: classifications[i] = "veleros-broker"  # marina
for i in [681,682,683,684,685,686,687,688,689,690,691,692,693,694,695,696,697,698,699]: classifications[i] = "travesias-navegacion"

# Sheet 14 (700-749): veleros/servicios, marina, fragata BA, navegación
for i in range(700, 750):
    classifications[i] = "veleros-broker"
for i in [700,701,702,703,704,705,706,707,708,709,710]: classifications[i] = "veleros-broker"
for i in [711,712,713]: classifications[i] = "travesias-navegacion"
for i in [714,715,716,717,718,719,720]: classifications[i] = "veleros-broker"  # marina
for i in [721,722,723,724,725,726,727,728,729,730,731,732,733,734,735]: classifications[i] = "buenos-aires-paisaje"  # fragata + skyline BA
for i in [736,737,738,739,740,741,742,743,744,745,746,747,748,749]: classifications[i] = "veleros-broker"

# Sheet 15 (750-799): fragata BA, destinos/lago, navegación atardecer
for i in range(750, 800):
    classifications[i] = "buenos-aires-paisaje"
for i in [750,751,752,753,754,755,756,757,758,759,760]: classifications[i] = "buenos-aires-paisaje"  # fragata
for i in [761,762,763,764,765,766,767,768,769,770]: classifications[i] = "destinos"  # lago/barcos en destino
for i in [771,772,773,774,775,776,777,778,779]: classifications[i] = "travesias-navegacion"  # navegando BA
for i in [780,781,782,783,784,785,786,787,788]: classifications[i] = "buenos-aires-paisaje"  # atardecer
for i in [789,790,791,792,793,794,795,796,797,798,799]: classifications[i] = "grupos-experiencia"

# Sheet 16 (800-849): servicios/lona, marina, navegación, atardecer
for i in range(800, 850):
    classifications[i] = "servicios"
for i in [800,801,802,803,804,805,806,807,808,809,810,811,812,813,814,815]: classifications[i] = "servicios"  # poniendo lona/mantenimiento
for i in [816,817,818,819,820,821,822,823,824,825]: classifications[i] = "veleros-broker"  # marina
for i in [825,826,827,828,829,830,831,832,833,834,835,836,837,838,839,840,841,842,843,844,845,846,847,848,849]: classifications[i] = "veleros-broker"

# Sheet 17 (850-873): veleros navegando "Indigo", marina, servicios
for i in range(850, 874):
    classifications[i] = "veleros-broker"
for i in [850,851,852,853,854,855,856,857,858]: classifications[i] = "travesias-navegacion"  # veleros "Indigo" navegando
for i in [859,860,861,862,863,864]: classifications[i] = "veleros-broker"
for i in [865,866,867,868,869]: classifications[i] = "servicios"
for i in [870,871,872,873]: classifications[i] = "veleros-broker"

# Save
class_dict = {str(k): v for k, v in classifications.items()}
with open(OUT_DIR / "video-classifications.json", "w") as f:
    json.dump(class_dict, f)

# Stats
from collections import Counter
cats = Counter(classifications.values())
print("Video classification results:")
for cat, count in cats.most_common():
    print(f"  {cat}: {count}")

# Inject into preview HTML
html_path = OUT_DIR / "preview-clasificar-videos.html"
html = html_path.read_text(encoding="utf-8")
old = "const classifications = JSON.parse(localStorage.getItem('enba-video-class') || '{}');"
new = f"const classifications = JSON.parse(localStorage.getItem('enba-video-class') || '{json.dumps(class_dict)}');"
html = html.replace(old, new)
html_path.write_text(html, encoding="utf-8")
print("\nPreview HTML updated with pre-classifications")
