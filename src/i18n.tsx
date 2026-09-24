import React, { useLayoutEffect, useRef } from "react";
import { useSettings } from "./context";

/** Arabic UI copy. Chess notation, algebraic coordinates, and player-entered names stay as entered. */
const ar: Record<string, string> = {
  "AN EXPERIMENT IN CHESS": "تجربة في الشطرنج",
  "Settings": "الإعدادات",
  "FOUR WAYS TO OUTTHINK THE BOARD": "أربع طرق للتفوّق على الرقعة",
  "SIX WAYS TO OUTTHINK THE BOARD": "ست طرق للتفوّق على الرقعة",
  "A familiar board in unfamiliar territory.": "رقعة مألوفة في عالم مختلف.",
  " Pick a variant. Make the next move matter.": " اختر نمطًا واجعل لكل نقلة أثرًا.",
  "Pick a variant. Make the next move matter.": "اختر نمطًا واجعل لكل نقلة أثرًا.",
  "Choose your gambit": "اختر خطتك",
  "Four local two-player variants": "أربعة أنماط للعب المحلي بين لاعبين",
  "Six local two-player variants": "ستة أنماط للعب المحلي بين لاعبين",
  "THE BOARD IS NEVER THE SAME TWICE": "الرقعة لا تتكرر مرتين",
  "SCROLL? THERE IS NO OTHER SIDE.": "تبحث عن الأسفل؟ لا يوجد جانب آخر.",
  "THINK COLD. MOVE BOLD.": "فكّر بهدوء. وانقل بجرأة.",
  "Chaos": "الفوضى",
  "Gambit": "المناورة",
  "Chaos ": "الفوضى ",
  "CHAOS ": "الفوضى ",
  "CHAOS": "الفوضى",
  "GAMBIT": "المناورة",
  "Back": "رجوع",
  "Workshop": "ورشة القواعد",
  "Archive": "الأرشيف",
  "Display": "العرض",
  "THE NEXT MOVE IS YOURS": "النقلة التالية لك",
  "Choose your ": "اختر ",
  "Choose your": "اختر",
  "gambit.": "مناورتك.",
  "Four local games. Four different kinds of pressure.": "أربع مباريات محلية وأربعة أنواع مختلفة من التحدي.",
  "Six local games. Six different kinds of pressure.": "ستة أنماط محلية، وستة أنواع مختلفة من التحدي.",
  "How to play": "طريقة اللعب",
  "Classic Clash": "المواجهة الكلاسيكية",
  "Mystery Piece": "القطعة المجهولة",
  "Dice Gambit": "مناورة النرد",
  "Spellbound": "سحر الرقعة",
  "King of the Hill": "ملك التل",
  "Duck Chess": "شطرنج البطة",
  "Reach the center. Hold your nerve.": "بلغ المركز وحافظ على رباطة جأشك.",
  "Move a piece. Then move the blocker.": "حرّك قطعة، ثم حرّك البطة.",
  "CENTER RACE": "سباق نحو المركز",
  "TACTICAL BLOCKER": "عائق تكتيكي",
  "MIN": "دقيقة",
  "No clock": "بلا ساعة",
  "Move log": "سجل النقلات",
  "Pause": "إيقاف مؤقت",
  "Play again": "العب مجددًا",
  "THE CENTER IS CLAIMED": "حُسم المركز",
  "KING OF THE HILL": "ملك التل",
  "THE KING HAS FALLEN": "سقط الملك",
  "KING CAPTURE": "أسر الملك",
  "CHECKMATE": "كش مات",
  "THE BOARD IS SEALED": "أُغلقت الرقعة",
  "A STANDSTILL": "تعادل بالجمود",
  "STALEMATE": "جمود",
  "TIME HAS RUN OUT": "انتهى الوقت",
  "TIME FORFEIT": "انتهاء الوقت",
  "MATCH COMPLETE": "انتهت المباراة",
  "FINAL POSITION": "الوضع النهائي",
  "· VICTORY": "· فوز",
  "PLACE THE DUCK": "ضع البطة",
  "Each turn: move a piece, then move the duck": "في كل دور: حرّك قطعة، ثم انقل البطة",
  "Choose an empty square for the duck": "اختر مربعًا فارغًا لوضع البطة",
  "Win by checkmate or bring your king to the center": "الفوز بكش مات أو بإيصال ملكك إلى المركز",
  "STANDARD CHESS · CENTER WIN": "شطرنج قياسي · الفوز بالوصول إلى المركز",
  "KING CAPTURE · DUCK BLOCKER": "أسر الملك · البطة العائقة",
  "Chaos Gambit": "مناورة الفوضى",
  "Visit Mastermind_S7's Chess.com profile (opens in a new tab)": "زيارة صفحة Mastermind_S7 على Chess.com (تُفتح في علامة تبويب جديدة)",
  "Black wins on time.": "فاز الأسود لانتهاء الوقت.",
  "White wins on time.": "فاز الأبيض لانتهاء الوقت.",
  "Draw by stalemate.": "تعادل بسبب الجمود.",
  "Play standard chess with a center-based victory condition. The Workshop lets you choose the hill size and whether checkmate also wins.": "العب الشطرنج بقواعده المعتادة مع شرط إضافي للفوز بالوصول إلى المركز. تتيح لك ورشة القواعد اختيار مساحة التلة وما إذا كان كش مات يحقق الفوز أيضًا.",
  "Move one piece, then move the duck. Every open square can change the line.": "حرّك قطعة واحدة، ثم انقل البطة. فكل مربع مفتوح قد يغيّر مجرى اللعب.",
  "The center is another checkmate": "المركز طريق آخر للفوز",
  "Move and capture by standard chess rules.": "تحرّك واستولِ على القطع وفق قواعد الشطرنج المعتادة.",
  "Win by checkmate or by moving your king to a highlighted center square.": "الفوز يكون بكش مات أو بتحريك ملكك إلى أحد المربعات المركزية المميزة.",
  "Win by checkmate or bring your king to the highlighted center": "الفوز بكش مات أو بإيصال ملكك إلى المركز المميز",
  "Win by bringing your king to the highlighted center": "الفوز بإيصال ملكك إلى المركز المميز",
  "Center size and victory conditions": "حجم منطقة المركز وشروط الفوز",
  "Standard hill": "التلة القياسية",
  "Wide hill": "التلة الموسعة",
  "Center race": "سباق المركز",
  "Center objective": "منطقة المركز",
  "Four central squares": "المربعات المركزية الأربعة",
  "Sixteen central squares": "المربعات الستة عشر في الوسط",
  "Checkmate wins too": "كش مات يحقق الفوز أيضًا",
  "Yes, center or checkmate": "نعم، المركز أو كش مات",
  "No, center only": "لا، المركز فقط",
  "Duck movement and stalemate outcome": "حركة البطة ونتيجة الجمود",
  "Duck may stay": "يمكن للبطة البقاء",
  "Stalemate draw": "التعادل عند الجمود",
  "Duck can stay in place": "يمكن للبطة البقاء في مكانها",
  "No, it must move": "لا، يجب أن تتحرك",
  "Yes, it may stay": "نعم، يمكنها البقاء",
  "If opponent has no legal move": "إذا لم تتوفر للخصم نقلة قانونية",
  "Last mover wins": "يفوز صاحب النقلة الأخيرة",
  "Draw": "تعادل",
  "Your king still cannot move into check. The hill win is checked immediately after each legal move.": "لا يجوز لملكك الانتقال إلى مربع مهدد. ويُحتسب الفوز بالوصول إلى المركز فور تنفيذ النقلة القانونية.",
  "Two actions. One tactical turn.": "خطوتان في دور تكتيكي واحد",
  "Move one chess piece using standard movement; checks are ignored.": "حرّك قطعة شطرنج وفق حركتها المعتادة؛ لا يُعتد بالكش أو بكش مات.",
  "THE ORIGINAL": "النمط الأصلي",
  "INFORMATION GAME": "لعبة معلومات",
  "CHANCE & TACTICS": "حظ وتكتيك",
  "TACTICAL MAGIC": "سحر تكتيكي",
  "Pure chess. Your clock, your pressure.": "شطرنج خالص. ساعتك وضغطك.",
  "Hide one piece. Find theirs.": "أخفِ قطعة واكتشف قطعته.",
  "The roll decides what can move.": "تحدّد الرمية القطع التي يمكن تحريكها.",
  "Spend magic to reshape a turn.": "استخدم السحر لتغيير مجرى النقلة.",
  "Play mode": "ابدأ اللعب",
  "Rules": "القواعد",
  "Your table, your look": "رقعتك بطابعك",
  "Board theme · ": "مظهر الرقعة · ",
  "Board theme ·": "مظهر الرقعة ·",
  "Choose board theme": "اختر مظهر الرقعة",
  "board theme": "مظهر الرقعة",
  "Tune variant rules": "اضبط قواعد الأنماط",
  "YOUR TABLE, YOUR RULES": "رقعتك وقواعدك",
  "Variant workshop": "ورشة الأنماط",
  "Choose a preset or tune a rule. Changes save on this device and apply to new games.": "اختر إعدادًا جاهزًا أو عدّل قاعدة. تُحفظ التغييرات على هذا الجهاز وتُطبّق على المباريات الجديدة.",
  "Reset defaults": "استعادة الافتراضي",
  "Clock settings · applies to Classic games": "إعدادات الساعة · تُطبّق على النمط الكلاسيكي",
  "Blitz": "خاطف",
  "Rapid": "سريع",
  "Relaxed": "هادئ",
  "Minutes per player": "دقائق لكل لاعب",
  "Increment per move": "زيادة الوقت لكل نقلة",
  "min": "دقيقة",
  "sec": "ثانية",
  "Match length · handoff stays private": "طول المباراة · يظل اختيار القطعة سريًا",
  "Quick round": "جولة سريعة",
  "Best of 5": "الأفضل من ٥ جولات",
  "Best of 9": "الأفضل من ٩ جولات",
  "Rounds to win match": "الجولات اللازمة للفوز",
  "wins": "فوز",
  "The secret-piece handoff remains enabled before each player selects.": "يبقى تمرير الجهاز مع إخفاء الاختيار مفعّلًا قبل اختيار كل لاعب.",
  "Roll count, distribution, and win condition": "عدد الرميات وتوزيعها وشرط الفوز",
  "Standard": "قياسي",
  "Wild": "فوضوي",
  "Tactical": "تكتيكي",
  "Piece rolls per turn": "رميات القطع في النقلة",
  "rolls": "رميات",
  "Roll weighting": "توزيع احتمالات الرمية",
  "Game-phase weighting": "بحسب مرحلة المباراة",
  "Even odds": "احتمالات متساوية",
  "High volatility": "تقلّب مرتفع",
  "Win condition": "شرط الفوز",
  "King capture or checkmate": "أسر الملك أو كش مات",
  "Checkmate only": "كش مات فقط",
  "Per-player resources and spell timing": "موارد كل لاعب وتوقيت التعويذات",
  "Generous magic": "سحر وفير",
  "Scarce magic": "سحر محدود",
  "Freeze uses": "مرات التجميد",
  "Jump uses": "مرات القفز",
  "Freeze cooldown": "فترة انتظار التجميد",
  "Jump cooldown": "فترة انتظار القفز",
  "Freeze radius": "نطاق التجميد",
  "Freeze duration": "مدة التجميد",
  "uses": "مرات",
  "turns": "نقلات",
  "squares": "مربعات",
  "Rules saved locally · New games use the latest settings": "حُفظت القواعد على الجهاز · ستستخدم المباريات الجديدة أحدث الإعدادات",
  "LOCAL TABLE · 2 PLAYERS": "لعب محلي · لاعبان",
  "CHAOS GAMBIT ": "مناورة الفوضى ",
  "CHAOS GAMBIT": "مناورة الفوضى",
  " — TAKE YOUR TIME. THEN TAKE THE KING.": " — تمهّل، ثم ظفَر بالملك.",
  "TAKE YOUR TIME. THEN TAKE THE KING.": "تمهّل، ثم استولِ على الملك.",
  "RULES BRIEFING": "شرح القواعد",
  "Start ": "ابدأ ",
  "Start": "ابدأ",
  "Choose a variant briefing": "اختر شرح النمط",
  "briefing": "شرح القواعد",
  "A clean game of chess": "مباراة شطرنج صافية",
  "Take turns on a standard chessboard. Checkmate wins. Choose a time control in the Workshop before you begin.": "تبادل الأدوار على رقعة شطرنج عادية. الفوز يكون بكش مات. اختر مدة المباراة من ورشة القواعد قبل البدء.",
  "Each player secretly chooses one of their own pieces behind a pass-device handoff. Move, ask questions aloud, or spend a turn guessing. Capturing the hidden piece or checkmating wins the round.": "يختار كل لاعب إحدى قطعه سرًا عند تمرير الجهاز. حرّك قطعة أو اطرح سؤالًا بصوت مسموع أو استهلك نقلة لتخمين قطعة. يفوز بالجولة من يأسر القطعة المخفية أو يحقق كش مات.",
  "Roll a set of piece types, then move one eligible piece for each face in sequence. A roll with no legal move is skipped. The standard rules let you win by capturing the king or checkmate.": "ارمِ النرد لتحديد أنواع القطع، ثم حرّك قطعة متاحة لكل وجه بالتتابع. تُتجاوز الرمية التي لا تتيح نقلة قانونية. في القواعد القياسية، يكون الفوز بأسر الملك أو بكش مات.",
  "Each side begins with a limited supply of Freeze and Jump. Freeze locks a 3×3 patch for a turn; Jump lets one friendly piece phase through blockers. Checkmate still decides the game.": "يبدأ كل لاعب بعدد محدود من تعويذتي التجميد والقفز. يجمّد التجميد مساحة ٣×٣ لنقلة، ويسمح القفز لقطعة صديقة بالعبور من خلال العوائق. يظل كش مات حاسمًا للمباراة.",
  "White moves first; then alternate turns.": "يبدأ الأبيض، ثم يتناوب اللاعبان على النقل.",
  "Select a piece, then a highlighted legal square.": "اختر قطعة، ثم مربعًا قانونيًا مميزًا.",
  "Checkmate ends the game. Use the move log to review the line.": "ينهي كش مات المباراة. راجع تسلسل النقلات في سجل النقلات.",
  "Hide. Move. Discover.": "أخفِ. انقل. اكتشف.",
  "White secretly marks one of their pieces, then passes the device to Black.": "يختار الأبيض إحدى قطعه سرًا، ثم يمرر الجهاز إلى الأسود.",
  "Black marks a piece without seeing White’s choice; play then begins.": "يختار الأسود قطعة دون رؤية اختيار الأبيض، ثم تبدأ المباراة.",
  "On your turn, move, ask a question aloud, or guess a piece. Guessing costs your turn; a correct guess wins the round.": "في دورك، حرّك قطعة أو اطرح سؤالًا بصوت مسموع أو خمّن قطعة. يستهلك التخمين نقلتك، والتخمين الصحيح يفوز بالجولة.",
  "Let the roll narrow the board": "دع الرمية تحدّد خياراتك",
  "Roll to reveal the piece types you may move this turn.": "ارمِ النرد لتعرف أنواع القطع المسموح بتحريكها في هذه النقلة.",
  "Play the shown types from left to right; impossible rolls are skipped.": "حرّك القطع الظاهرة من اليسار إلى اليمين، وتُتجاوز الرميات التي لا تتيح نقلة قانونية.",
  "A king capture or checkmate ends the standard game. Change roll behavior in the Workshop.": "ينهي أسر الملك أو كش مات المباراة القياسية. غيّر آلية الرمي من ورشة القواعد.",
  "Use magic with intent": "استخدم السحر بحكمة",
  "Choose Freeze, then a target square to freeze its surrounding area.": "اختر التجميد، ثم مربعًا لتجميد المنطقة المحيطة به.",
  "Choose Jump, then a friendly piece to let it phase through blockers.": "اختر القفز، ثم قطعة لك لتمريرها عبر العوائق.",
  "Spells have limited uses and cooldowns. Checkmate still wins.": "للتعويذات استخدامات محدودة وفترات انتظار. يظل كش مات شرط الفوز.",
  "DISPLAY PREFERENCES": "تفضيلات العرض",
  "MAKE THE BOARD YOURS": "اجعل الرقعة على ذوقك",
  "Visual preferences are saved on this device.": "تُحفظ تفضيلات العرض على هذا الجهاز.",
  "Board palette": "ألوان الرقعة",
  "Choose the light and dark square colors.": "اختر لونَي المربعات الفاتحة والداكنة.",
  "Piece finish": "نمط القطع",
  "Pick a style that reads clearly on your board.": "اختر نمطًا واضحًا على رقعتك.",
  "solid": "ممتلئ",
  "flat": "مسطح",
  "Board details": "تفاصيل الرقعة",
  "Clarity and feedback in play.": "وضوح وملاحظات أثناء اللعب.",
  "Show coordinates": "إظهار الإحداثيات",
  "Highlight legal moves": "تمييز النقلات القانونية",
  "Enable sounds": "تفعيل الأصوات",
  "Confirm moves": "تأكيد النقلات",
  "Motion pace": "سرعة الحركة",
  "Choose the board animation speed.": "اختر سرعة حركة القطع على الرقعة.",
  "slow": "بطيء",
  "normal": "عادي",
  "fast": "سريع",
  "Back to title": "العودة إلى العنوان",
  "Learn ": "تعرّف على ",
  "Learn": "تعرّف على",
  "Close rules briefing": "إغلاق شرح القواعد",
  "View archive": "عرض الأرشيف",
  "Move Log": "سجل النقلات",
  "Undo": "تراجع",
  "Restart": "إعادة البدء",
  "Back to modes": "العودة إلى الأنماط",
  "SET THE TERMS OF PLAY": "اختر شروط المباراة",
  "THE CENTER IS THE CROWN": "المركز هو التاج",
  "ONE BLOCKER. ENDLESS LINES": "عائق واحد، ومسارات لا تنتهي",
  "LOCAL MATCH": "مباراة محلية",
  "Choose who will take the other side.": "اختر من سيلعب بالجهة الأخرى.",
  "Choose opponent": "اختر الخصم",
  "Share this board": "العبا على الجهاز نفسه",
  "Choose your side": "اختر لون قطعك",
  "Two players, one board": "لاعبان ورقعة واحدة",
  "Pass the device after each turn. This variant is local play.": "مرّر الجهاز بعد كل دور. هذا النمط للعب المحلي.",
  "2 PLAYERS": "لاعبان",
  "Time control": "التحكم بالوقت",
  "Set a clock for each player.": "حدّد وقتًا لكل لاعب.",
  "Bonus per move": "وقت إضافي لكل نقلة",
  "Add time after each completed move.": "أضف وقتًا بعد كل نقلة مكتملة.",
  "Bonus time per move": "الوقت الإضافي لكل نقلة",
  "Start game": "ابدأ المباراة",
  "A relaxed game with no clock": "مباراة هادئة بلا ساعة",
  "Place the duck on an empty square. The Workshop can allow it to stay in place. It blocks every piece except that knights can jump over it.": "ضع البطة على مربع فارغ. ويمكن ضبط القواعد للسماح لها بالبقاء في مكانها. وهي تعيق كل القطع باستثناء الأحصنة التي تقفز فوقها.",
  "Capture the opposing king to win. The Workshop sets the result if the next player has no legal move after duck placement.": "أسر ملك الخصم لتحقيق الفوز. وتحدد ورشة القواعد النتيجة إذا لم تتوفر للاعب التالي نقلة قانونية بعد وضع البطة.",
  "Paused": "متوقفة مؤقتًا",
  "Computer is thinking…": "يفكّر الحاسوب…",
  "Game recap": "ملخص المباراة",
  "No moves yet": "لا توجد نقلات بعد",
  "Click a move to view historic state": "اختر نقلة لعرض وضع الرقعة حينها",
  "White": "الأبيض",
  "Black": "الأسود",
  "Local · offline": "محلي · دون إنترنت",
  "Game archive": "أرشيف المباريات",
  "Close": "إغلاق",
  "Completed games saved here will appear in this list.": "ستظهر هنا المباريات المكتملة التي حُفظت.",
  "Initial position": "الوضع الابتدائي",
  "Previous": "السابق",
  "Next": "التالي",
  "End": "النهاية",
  "Export PGN": "تصدير PGN",
  "Delete": "حذف",
  "Annotation": "تعليق",
  "Add a note for this ply…": "أضف ملاحظة لهذه النقلة…",
  "Select an archived game to replay.": "اختر مباراة من الأرشيف لإعادة عرضها.",
  "ICE": "جليد",
  "PHASE": "عبور",
  "Frostbite": "الصقيع",
  "Phasing": "العبور",
  "NEXT TURN": "الدور التالي",
  "GUESS": "تخمين",
  "Secret Piece": "القطعة السرية",
  "End Turn": "إنهاء الدور",
  "Tap Opponent Piece!": "المس قطعة الخصم!",
  "Rounds": "الجولات",
  "first to ": "أول من يحقق ",
  "first to": "الأسبق إلى",
  "Make sure the other player isn't looking before continuing!": "تأكد أن اللاعب الآخر لا ينظر قبل المتابعة!",
  "Saved Match Info": "معلومات المباراة المحفوظة",
  "White Time": "وقت الأبيض",
  "Black Time": "وقت الأسود",
  "Time Format:": "نمط الوقت:",
  "Current Turn:": "الدور الحالي:",
  "Moves Played:": "النقلات المنفذة:",
  "You have a classic game in progress. Would you like to resume or start fresh?": "لديك مباراة كلاسيكية جارية. هل تريد استئنافها أم بدء مباراة جديدة؟",
  "RESUME GAME": "استئناف المباراة",
  "Configure your match settings before starting.": "اضبط إعدادات المباراة قبل البدء.",
  "Opponent": "الخصم",
  "White (move first)": "الأبيض (يبدأ أولًا)",
  "Casual · one-move lookahead": "سهل · يتوقع نقلة واحدة",
  "Balanced · two-ply search": "متوازن · يبحث نقلتين",
  "Strong · three-ply, narrowed search": "قوي · يبحث ثلاث نقلات بنطاق أضيق",
  "Computer play is available in Classic only. Strength describes this app’s lightweight local search, not a rated engine.": "اللعب ضد الحاسوب متاح في النمط الكلاسيكي فقط. مستويات القوة تصف البحث المحلي المبسط في التطبيق وليست محركًا مصنفًا.",
  "Time Control": "التحكم بالوقت",
  "Untimed": "دون توقيت",
  "No Clock": "بلا ساعة",
  "Min": "دقيقة",
  "Bonus Time per Move": "الوقت الإضافي لكل نقلة",
  "Move": "النقلة",
  "Round ": "الجولة ",
  "Round": "الجولة",
  "White's Spells": "تعويذات الأبيض",
  "Black's Spells": "تعويذات الأسود",
  "Choose a mode": "اختر نمطًا",
  "Switch language to Arabic": "تغيير اللغة إلى العربية",
  "Switch language to English": "التغيير إلى الإنجليزية",
  "English": "الإنجليزية",
  "العربية": "العربية",
  "Language / اللغة": "اللغة",
  "Choose the interface language.": "اختر لغة الواجهة.",
  "Start Game": "ابدأ المباراة",
  "New Game": "مباراة جديدة",
  "Resume Game": "استئناف المباراة",
  "No Increment": "دون زيادة",
  "No increment": "دون زيادة",
  "Play Again": "العب مجددًا",
  "King capture": "أسر الملك",
  "Checkmate": "كش مات",
  "Draw by Stalemate.": "تعادل بسبب الجمود.",
  "Draw by Stalemate": "تعادل بسبب الجمود",
  "White wins by King Capture!": "فاز الأبيض بأسر الملك!",
  "Black wins by King Capture!": "فاز الأسود بأسر الملك!",
  "White wins by Checkmate!": "فاز الأبيض بكش مات!",
  "Black wins by Checkmate!": "فاز الأسود بكش مات!",
  "Black wins on time!": "فاز الأسود لانتهاء الوقت!",
  "White wins on time!": "فاز الأبيض لانتهاء الوقت!",
  "White Wins by King Capture!": "فاز الأبيض بأسر الملك!",
  "Black Wins by King Capture!": "فاز الأسود بأسر الملك!",
  "White Wins by Checkmate!": "فاز الأبيض بكش مات!",
  "Black Wins by Checkmate!": "فاز الأسود بكش مات!",
  "Rolling...": "جارٍ الرمي…",
  "Dice": "النرد",
  "Opening": "الافتتاح",
  "Middle": "منتصف المباراة",
  "Endgame": "نهاية المباراة",
  "Even odds for each piece": "احتمالات متساوية لكل قطعة",
  "King 8% · Queen 22%": "الملك ٨٪ · الوزير ٢٢٪",
  "Confirm move": "تأكيد النقلة",
  "Cancel move": "إلغاء النقلة",
  "CANCEL MOVE": "إلغاء النقلة",
  "Choose Promotion": "اختر الترقية",
  "Queen": "وزير",
  "Rook": "قلعة",
  "Bishop": "فيل",
  "Knight": "حصان",
  "The frost has melted. Frozen squares are clear.": "ذاب الجليد وأصبحت المربعات حرة.",
  "The frost recedes; remaining frozen squares are still marked on the board.": "ينحسر الصقيع، وتظل المربعات المتجمدة محددة على الرقعة.",
  "Jump": "قفز",
  "Freeze": "تجميد",
  "Your turn": "دورك",
  "Current turn": "الدور الحالي",
  "Game ended, but the local archive could not save this record. Check browser storage space.": "انتهت المباراة، لكن تعذّر حفظها في الأرشيف المحلي. تحقق من مساحة تخزين المتصفح.",
  "Classic": "كلاسيكي",
  "classic": "كلاسيكي",
  "walnut": "خشبي",
  "midnight": "ليلي",
  "ice": "جليدي",
  "balanced": "متوازن",
  "casual": "سهل",
  "strong": "قوي",
  "Noob 1": "اللاعب ١",
  "Noob 2": "اللاعب ٢",
  "White: Get ready to securely pick your piece!": "الأبيض: استعد لاختيار قطعتك بسرية!",
  "White: Secretly select your piece!": "الأبيض: اختر قطعتك سرًا!",
  "Black: Secretly select your piece!": "الأسود: اختر قطعتك سرًا!",
  "White's Turn! Ask a verbal question, Move, or Guess.": "دور الأبيض! اطرح سؤالًا شفهيًا أو انقل قطعة أو خمّن.",
  "Black's Turn! Ask a verbal question, Move, or Guess.": "دور الأسود! اطرح سؤالًا شفهيًا أو انقل قطعة أو خمّن.",
  "Original": "أصلي",
  "Game over": "انتهت المباراة",
  "Close move log": "إغلاق سجل النقلات",
  "Chessboard replay position": "موضع الرقعة في إعادة العرض",
  "Chessboard. Use arrow keys to move between squares and Enter or Space to select.": "رقعة الشطرنج. استخدم الأسهم للتنقل بين المربعات، ثم اضغط Enter أو المسافة للاختيار.",
  "I'm Ready": "أنا مستعد",
  "Pass device to Black to select their piece.": "مرّر الجهاز إلى الأسود ليختار قطعته.",
  "FALSE! Incorrect Guess.": "خطأ! تخمين غير صحيح.",
  "Start New Match": "ابدأ مباراة جديدة",
  "Next Round": "الجولة التالية",
  "Return to Live": "العودة إلى المباراة الحالية",
  "Viewing Move ": "عرض النقلة ",
  "Viewing Move": "عرض النقلة",
  "Resume": "استئناف",
  "Roll": "ارمِ النرد",
  "Freeze 3x3 square": "جمّد مربعًا بحجم ٣×٣",
  "Jump over obstacles": "اقفز فوق العوائق",
  "Click any square to cast a 3x3 Frostbite": "المس أي مربع لإلقاء تعويذة الصقيع ٣×٣",
  "Click a friendly piece to let it Phase through others": "المس قطعة لك لتسمح لها بعبور القطع الأخرى",
  "Phase is charged: the marked piece may pass through occupied squares for its next move.": "العبور جاهز: يمكن للقطعة المحددة تجاوز المربعات المشغولة في نقلتها التالية.",
  "The marked piece may pass through blockers on its next move.": "يمكن للقطعة المحددة تجاوز العوائق في نقلتها التالية.",
  "Classic Mode": "النمط الكلاسيكي",
  "Two players": "لاعبان",
  "Play the computer": "العب ضد الحاسوب",
  "START GAME": "ابدأ المباراة",
  "You": "أنت",
  "Computer": "الحاسوب",
  "No games yet": "لا توجد مباريات بعد",
  "Start a new match": "ابدأ مباراة جديدة",
  "Yes": "نعم",
  "No": "لا",
  "Live": "مباشر",
  "Current turn:": "الدور الحالي:",
};

function translate(value: string): string {
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  const core = value.slice(leading.length, value.length - trailing.length);
  let result = ar[core];
  if (!result) {
    const round = core.match(/^Round (\d+)$/);
    const dice = core.match(/^Roll (\d+) Dice$/);
    const kingOdds = core.match(/^King: (\d+)%$/);
    const ply = core.match(/^Ply (\d+) of (\d+)$/);
    const count = core.match(/^([+]\d+)$/);
    const increment = core.match(/^\+(\d+)s$/);
    const timeSummary = core.match(/^(\d+) minute clock(?: · \+(\d+)s per move)?$/);
    const playerName = core.match(/^(White|Black) · Player ([12])$/);
    const gameResult = core.match(/^(White|Black) wins by (reaching the center|capturing the king|checkmate)\.$/);
    const stalemateResult = core.match(/^(White|Black) wins by stalemate\.$/);
    if (round) result = `الجولة ${round[1]}`;
    else if (dice) result = `ارمِ النرد ${dice[1]} مرات`;
    else if (kingOdds) result = `احتمال الملك: ${kingOdds[1]}٪`;
    else if (ply) result = `النقلة ${ply[1]} من ${ply[2]}`;
    else if (count) result = count[1];
    else if (increment) result = `+${increment[1]} ث`;
    else if (timeSummary) result = `${timeSummary[1]} ${timeSummary[1] === "1" ? "دقيقة" : "دقائق"} على الساعة${timeSummary[2] ? ` · +${timeSummary[2]} ثوانٍ لكل نقلة` : ""}`;
    else if (playerName) result = `${playerName[1] === "White" ? "الأبيض" : "الأسود"} · اللاعب ${playerName[2] === "1" ? "١" : "٢"}`;
    else if (gameResult) result = `فاز ${gameResult[1] === "White" ? "الأبيض" : "الأسود"} ${gameResult[2] === "reaching the center" ? "بإيصال الملك إلى المركز" : gameResult[2] === "capturing the king" ? "بأسر الملك" : "بكش مات"}.`;
    else if (stalemateResult) result = `فاز ${stalemateResult[1] === "White" ? "الأبيض" : "الأسود"} بسبب الجمود.`;
    else if (/^Play (Classic Clash|Mystery Piece|Dice Gambit|Spellbound|King of the Hill|Duck Chess)$/.test(core)) result = `ابدأ اللعب: ${ar[core.slice(5)]}`;
    else if (/^Learn (Classic Clash|Mystery Piece|Dice Gambit|Spellbound|King of the Hill|Duck Chess)$/.test(core)) result = `تعرّف على ${ar[core.slice(6)]}`;
    else if (/^(Classic Clash|Mystery Piece|Dice Gambit|Spellbound|King of the Hill|Duck Chess) briefing$/.test(core)) result = `شرح ${ar[core.replace(/ briefing$/, "")]}`;
    else if (/^(classic|walnut|midnight|ice) board theme$/.test(core)) result = `${ar[core.replace(/ board theme$/, "")]} · مظهر الرقعة`;
    else {
      const frozen = core.match(/^Frostbite cast on ([a-h][1-8])\. (\d+) board squares frozen for (\d+) opponent turns?\.$/);
      const phased = core.match(/^(White|Black) phased ([A-Z]+) on ([a-h][1-8])\. It can pass through pieces on its next move, then the effect expires\.$/);
      const phaseEnd = core.match(/^(White|Black) used the phase jump\. The effect has expired\.$/);
    const winner = core.match(/^(White|Black) wins by (King Capture|Checkmate)!$/i);
      const cooldown = core.match(/^(\d+) turn CD$/);
      const frostNotice = core.match(/^(\d+) squares remain frozen\. Opponent turns left: (\d+)\.$/);
      if (frozen) result = `تم إلقاء الصقيع على ${frozen[1]}. تجمّد ${frozen[2]} من مربعات الرقعة لمدة ${frozen[3]} من نقلات الخصم.`;
      else if (phased) result = `${ar[phased[1]]} عبرت ${ar[phased[2]] ?? phased[2]} على ${phased[3]}. يمكنها تجاوز القطع في نقلتها التالية، ثم ينتهي التأثير.`;
      else if (phaseEnd) result = `${ar[phaseEnd[1]]} استخدم قفزة العبور. انتهى التأثير.`;
      else if (winner) result = `فاز ${ar[winner[1]]} بـ${ar[winner[2]] ?? "كش مات"}!`;
      else if (cooldown) result = `فترة الانتظار: ${cooldown[1]} من النقلات`;
      else if (frostNotice) result = `ما زالت ${frostNotice[1]} من مربعات الرقعة متجمدة. النقلات المتبقية للخصم: ${frostNotice[2]}.`;
    }
  }
  return `${leading}${result ?? core}${trailing}`;
}

function localize(node: React.ReactNode): React.ReactNode {
  if (typeof node === "string") return translate(node);
  if (Array.isArray(node)) return node.map((child, index) => <React.Fragment key={index}>{localize(child)}</React.Fragment>);
  if (!React.isValidElement(node)) return node;
  const props = node.props as Record<string, unknown>;
  const translatedProps: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (key === "children") translatedProps.children = localize(value as React.ReactNode);
    else if (typeof value === "string" && (key === "aria-label" || key === "title" || key === "placeholder")) translatedProps[key] = translate(value);
  }
  return React.cloneElement(node, translatedProps);
}

export function ArabicText({ children, enabled }: { children: React.ReactNode; enabled: boolean }) {
  return <>{enabled ? localize(children) : children}</>;
}

const textSources = new WeakMap<Text, string>();
const attributeSources = new WeakMap<Element, Map<string, string>>();

function translateDom(root: HTMLElement, enabled: boolean) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current: Node | null;
  while ((current = walker.nextNode())) {
    const parent = current.parentElement;
    if (!parent || parent.closest('input,textarea,script,style,[data-no-translate]')) continue;
    const node = current as Text;
    const prior = textSources.get(node);
    const raw = node.data;
    const source = prior && (raw === prior || translate(prior) === raw) ? prior : raw;
    textSources.set(node, source);
    const next = enabled ? translate(source) : source;
    if (node.data !== next) node.data = next;
  }
  for (const element of root.querySelectorAll("[aria-label],[title],[placeholder]")) {
    let sources = attributeSources.get(element);
    if (!sources) { sources = new Map(); attributeSources.set(element, sources); }
    for (const name of ["aria-label", "title", "placeholder"]) {
      const value = element.getAttribute(name);
      if (value === null) continue;
      const prior = sources.get(name);
      const source = prior && (value === prior || translate(prior) === value) ? prior : value;
      sources.set(name, source);
      const next = enabled ? translate(source) : source;
      if (value !== next) element.setAttribute(name, next);
    }
  }
}

/** Localizes rendered interface copy and accessible labels as screens mount and update. */
export function LocalizedRoot({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const enabled = settings.locale === "ar";
    document.documentElement.lang = enabled ? "ar" : "en";
    document.documentElement.dir = enabled ? "rtl" : "ltr";
    translateDom(element, enabled);
    const observer = new MutationObserver(() => translateDom(element, enabled));
    observer.observe(element, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["aria-label", "title", "placeholder"] });
    return () => observer.disconnect();
  }, [settings.locale]);
  return <div ref={root} className="app-locale-root" lang={settings.locale} dir={settings.locale === "ar" ? "rtl" : "ltr"}>{children}</div>;
}
