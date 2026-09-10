export type CopilotIntent="PRIORITIES"|"RISK"|"PROJECT"|"INTERVENTION"|"EXPLAIN"|"BRIEF"|"GENERAL";
export function routeCopilotQuestion(question:string):CopilotIntent{
 const q=question.toLowerCase();
 if(/attention|priorit|primero|today|hoy/.test(q)) return "PRIORITIES";
 if(/risk|riesgo|danger/.test(q)) return "RISK";
 if(/intervention|acción|action|recomend/.test(q)) return "INTERVENTION";
 if(/why|por qué|porque|explain|explica/.test(q)) return "EXPLAIN";
 if(/brief|summary|resumen/.test(q)) return "BRIEF";
 if(/project|proyecto/.test(q)) return "PROJECT";
 return "GENERAL";
}