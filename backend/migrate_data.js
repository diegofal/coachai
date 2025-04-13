const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/curso_coaching_ontologico', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conexión a MongoDB establecida'))
.catch(err => console.error('Error al conectar a MongoDB:', err));

// Importar modelos
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  registrationDate: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseLevel: { type: Number, required: true, enum: [1, 2, 3] },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
  paymentInfo: { type: Object }
});

const courseSchema = new mongoose.Schema({
  level: { type: Number, required: true, enum: [1, 2, 3] },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }]
});

const moduleSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, required: true },
  sections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }]
});

const sectionSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  videoUrl: { type: String },
  resources: [{ 
    title: String, 
    url: String, 
    type: { type: String, enum: ['pdf', 'video', 'link'] } 
  }],
  order: { type: Number, required: true }
});

const quizSchema = new mongoose.Schema({
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  questions: [{
    text: String,
    options: [String],
    correctAnswer: Number,
    explanation: String
  }],
  passingScore: { type: Number, default: 70 }
});

// Crear modelos
const User = mongoose.model('User', userSchema);
const Subscription = mongoose.model('Subscription', subscriptionSchema);
const Course = mongoose.model('Course', courseSchema);
const Module = mongoose.model('Module', moduleSchema);
const Section = mongoose.model('Section', sectionSchema);
const Quiz = mongoose.model('Quiz', quizSchema);

// Datos de cursos
const coursesData = [
  {
    level: 1,
    title: "Fundamentos del Coaching Ontológico",
    description: "Curso introductorio que te permitirá comprender los principios básicos del coaching ontológico, sus fundamentos teóricos y las competencias esenciales según la ICF.",
    price: 497
  },
  {
    level: 2,
    title: "Práctica del Coaching Ontológico",
    description: "Curso intermedio enfocado en la aplicación práctica de las herramientas y técnicas del coaching ontológico, con sesiones supervisadas y feedback personalizado.",
    price: 997
  },
  {
    level: 3,
    title: "Maestría en Coaching Ontológico",
    description: "Curso avanzado para dominar el arte del coaching ontológico, profundizando en los tres dominios del ser y preparándote para la certificación profesional de la ICF.",
    price: 2497
  }
];

// Datos de módulos para el nivel 1
const modulesLevel1 = [
  {
    title: "Introducción al Coaching Ontológico",
    description: "Fundamentos teóricos y filosóficos del coaching ontológico, su historia y diferencias con otros enfoques de coaching.",
    order: 1,
    sections: [
      {
        title: "¿Qué es el Coaching Ontológico?",
        content: `<div class="section-content">
          <p>El coaching ontológico es una disciplina que facilita el proceso de aprendizaje y transformación personal y profesional, basado en la interpretación de que los seres humanos son seres lingüísticos. Fue desarrollado principalmente por Fernando Flores, Rafael Echeverría y Julio Olalla, quienes integraron conceptos de la filosofía del lenguaje, la biología del conocimiento y la fenomenología.</p>
          
          <p>La palabra "ontología" proviene del griego "ontos" (ser) y "logos" (estudio), por lo que literalmente significa "el estudio del ser". El coaching ontológico se centra en la forma en que interpretamos quiénes somos y cómo existimos en el mundo, reconociendo que nuestra manera de ser condiciona el tipo de acciones que tomamos y los resultados que obtenemos.</p>
          
          <p>A diferencia de otros enfoques de coaching que se centran principalmente en las acciones y los resultados, el coaching ontológico trabaja en un nivel más profundo, abordando el ser que somos, nuestras interpretaciones y la forma en que nos observamos a nosotros mismos y al mundo.</p>
        </div>`,
        videoUrl: "https://www.youtube.com/embed/EJkmOjffFwo",
        resources: [
          {
            title: "Guía de Competencias ICF",
            url: "/recursos/guia_competencias_icf.pdf",
            type: "pdf"
          },
          {
            title: "Video: Introducción al Coaching Ontológico por Rafael Echeverría",
            url: "https://www.youtube.com/watch?v=EJkmOjffFwo",
            type: "video"
          }
        ],
        order: 1,
        quiz: {
          questions: [
            {
              text: "¿Cuál es la premisa fundamental del coaching ontológico?",
              options: [
                "Los seres humanos son principalmente seres emocionales",
                "Los seres humanos son seres lingüísticos",
                "Los seres humanos son seres racionales",
                "Los seres humanos son seres espirituales"
              ],
              correctAnswer: 1,
              explanation: "El coaching ontológico se basa en la premisa de que los seres humanos somos seres lingüísticos, lo que significa que existimos y nos constituimos en el lenguaje."
            },
            {
              text: "¿Quiénes son considerados los principales desarrolladores del coaching ontológico?",
              options: [
                "John Whitmore, Timothy Gallwey y Laura Whitworth",
                "Fernando Flores, Rafael Echeverría y Julio Olalla",
                "Carl Rogers, Abraham Maslow y Viktor Frankl",
                "Ken Wilber, Don Beck y Christopher Cowan"
              ],
              correctAnswer: 1,
              explanation: "Fernando Flores, Rafael Echeverría y Julio Olalla son considerados los principales desarrolladores del coaching ontológico, integrando conceptos de la filosofía del lenguaje, la biología del conocimiento y la fenomenología."
            },
            {
              text: "¿Qué distingue al coaching ontológico de otros enfoques de coaching?",
              options: [
                "Se centra exclusivamente en las acciones y los resultados",
                "Trabaja únicamente con el lenguaje verbal",
                "Aborda el ser que somos, nuestras interpretaciones y observaciones",
                "Se enfoca solo en el desarrollo profesional, no personal"
              ],
              correctAnswer: 2,
              explanation: "A diferencia de otros enfoques que se centran principalmente en acciones y resultados, el coaching ontológico trabaja en un nivel más profundo, abordando el ser que somos, nuestras interpretaciones y la forma en que nos observamos a nosotros mismos y al mundo."
            }
          ],
          passingScore: 70
        }
      },
      {
        title: "Los Tres Dominios del Ser",
        content: `<div class="section-content">
          <p>El coaching ontológico reconoce que los seres humanos existimos en tres dominios primarios: el dominio del lenguaje, el dominio emocional y el dominio corporal. Estos tres dominios están interrelacionados y se influyen mutuamente, formando una unidad coherente que constituye nuestro ser.</p>
          
          <h3>Dominio del Lenguaje</h3>
          <p>El lenguaje no es solo descriptivo, sino generativo. A través del lenguaje no solo describimos la realidad, sino que la creamos. Las conversaciones, las narrativas que construimos y las interpretaciones que hacemos configuran nuestra realidad y determinan nuestras posibilidades de acción.</p>
          
          <h3>Dominio Emocional</h3>
          <p>Las emociones son predisposiciones para la acción. Cada emoción abre ciertas posibilidades y cierra otras. Por ejemplo, desde la confianza podemos emprender acciones que serían imposibles desde el miedo. Las emociones colorean nuestra percepción del mundo y condicionan nuestras acciones.</p>
          
          <h3>Dominio Corporal</h3>
          <p>El cuerpo es nuestra forma primaria de estar en el mundo. Nuestra postura, gestos, movimientos y sensaciones físicas reflejan y a la vez influyen en nuestros pensamientos y emociones. El trabajo con la corporalidad permite acceder a dimensiones del ser que no son accesibles solo a través del lenguaje.</p>
          
          <p>El coaching ontológico trabaja con estos tres dominios de manera integrada, reconociendo que un cambio en cualquiera de ellos afecta a los demás. Esta visión integral permite abordar los desafíos y el desarrollo personal desde múltiples perspectivas, generando transformaciones más profundas y sostenibles.</p>
        </div>`,
        videoUrl: "https://www.youtube.com/embed/43S9sPRbgnw",
        resources: [
          {
            title: "Artículo: Los Tres Dominios del Ser",
            url: "https://centrodelcoaching.es/coaching-ontologico-los-3-dominios-del-ser/",
            type: "link"
          },
          {
            title: "Video: Conversación de Coaching Ontológico",
            url: "https://www.youtube.com/watch?v=43S9sPRbgnw",
            type: "video"
          }
        ],
        order: 2,
        quiz: {
          questions: [
            {
              text: "¿Cuáles son los tres dominios primarios del ser según el coaching ontológico?",
              options: [
                "Físico, mental y espiritual",
                "Lenguaje, emocional y corporal",
                "Cognitivo, conductual y social",
                "Personal, profesional y social"
              ],
              correctAnswer: 1,
              explanation: "Según el coaching ontológico, los tres dominios primarios del ser son: el dominio del lenguaje, el dominio emocional y el dominio corporal."
            },
            {
              text: "¿Qué característica del lenguaje destaca el coaching ontológico?",
              options: [
                "Su capacidad descriptiva únicamente",
                "Su naturaleza generativa",
                "Su función comunicativa básica",
                "Su estructura gramatical"
              ],
              correctAnswer: 1,
              explanation: "El coaching ontológico destaca la naturaleza generativa del lenguaje, reconociendo que a través del lenguaje no solo describimos la realidad, sino que la creamos."
            },
            {
              text: "Según el coaching ontológico, las emociones son:",
              options: [
                "Reacciones irracionales que debemos controlar",
                "Estados mentales sin relación con nuestras acciones",
                "Predisposiciones para la acción",
                "Fenómenos puramente fisiológicos"
              ],
              correctAnswer: 2,
              explanation: "En el coaching ontológico, las emociones son entendidas como predisposiciones para la acción. Cada emoción abre ciertas posibilidades y cierra otras."
            }
          ],
          passingScore: 70
        }
      }
    ]
  },
  {
    title: "Competencias Clave según la ICF",
    description: "Estudio detallado de las competencias fundamentales del coaching según la International Coach Federation y su aplicación en el coaching ontológico.",
    order: 2,
    sections: [
      {
        title: "Las 8 Competencias Clave de la ICF",
        content: `<div class="section-content">
          <p>La International Coach Federation (ICF) ha establecido un conjunto de ocho competencias clave que todo coach profesional debe desarrollar y demostrar. Estas competencias representan los estándares de excelencia en la práctica del coaching y son la base para la certificación profesional.</p>
          
          <h3>1. Demuestra Práctica Ética</h3>
          <p>Comprende y aplica constantemente la ética y los estándares del coaching. Mantiene una mentalidad de coaching en todas las interacciones.</p>
          
          <h3>2. Encarna una Mentalidad de Coaching</h3>
          <p>Desarrolla y mantiene una mentalidad abierta, curiosa, flexible y centrada en el cliente durante todo el proceso de coaching.</p>
          
          <h3>3. Establece y Mantiene Acuerdos</h3>
          <p>Establece y mantiene acuerdos claros sobre la relación de coaching, el proceso, los planes y las metas. Establece acuerdos para la sesión de coaching actual.</p>
          
          <h3>4. Cultiva Confianza y Seguridad</h3>
          <p>Colabora con el cliente para crear un ambiente seguro y de apoyo que permita al cliente compartir libremente. Mantiene una relación de respeto y confianza mutuos.</p>
          
          <h3>5. Mantiene Presencia</h3>
          <p>Es plenamente consciente y está presente con el cliente, empleando un estilo abierto, flexible, fundamentado y confiado.</p>
          
          <h3>6. Escucha Activamente</h3>
          <p>Se centra en lo que el cliente está y no está diciendo para comprender plenamente lo que se está comunicando en el contexto de los sistemas del cliente y para apoyar la autoexpresión del cliente.</p>
          
          <h3>7. Evoca Conciencia</h3>
          <p>Facilita el insight y el aprendizaje del cliente mediante el uso de herramientas y técnicas como preguntas poderosas, silencio, metáforas o analogías.</p>
          
          <h3>8. Facilita el Crecimiento del Cliente</h3>
          <p>Colabora con el cliente para transformar el aprendizaje y el insight en acción. Promueve la autonomía del cliente en el proceso de coaching.</p>
          
          <p>Estas competencias se aplican de manera integral en el coaching ontológico, que además añade la dimensión de los tres dominios del ser (lenguaje, emociones y corporalidad) como marco para el desarrollo de estas habilidades.</p>
        </div>`,
        videoUrl: "https://www.youtube.com/embed/EJkmOjffFwo",
        resources: [
          {
            title: "Guía de Competencias ICF",
            url: "/recursos/guia_competencias_icf.pdf",
            type: "pdf"
          },
          {
            title: "Sitio web oficial de la ICF",
            url: "https://coachingfederation.org/credentials-and-standards/core-competencies",
            type: "link"
          }
        ],
        order: 1,
        quiz: {
          questions: [
            {
              text: "¿Cuántas competencias clave ha establecido la ICF para la práctica profesional del coaching?",
              options: [
                "5",
                "8",
                "10",
                "12"
              ],
              correctAnswer: 1,
              explanation: "La International Coach Federation (ICF) ha establecido un conjunto de ocho competencias clave que todo coach profesional debe desarrollar y demostrar."
            },
            {
              text: "¿Cuál de las siguientes NO es una competencia clave según la ICF?",
              options: [
                "Escucha Activamente",
                "Mantiene Presencia",
                "Aplica Técnicas de Programación Neurolingüística",
                "Evoca Conciencia"
              ],
              correctAnswer: 2,
              explanation: "Aplicar Técnicas de Programación Neurolingüística no es una de las ocho competencias clave establecidas por la ICF. Las competencias son: Demuestra Práctica Ética, Encarna una Mentalidad de Coaching, Establece y Mantiene Acuerdos, Cultiva Confianza y Seguridad, Mantiene Presencia, Escucha Activamente, Evoca Conciencia, y Facilita el Crecimiento del Cliente."
            },
            {
              text: "¿Qué implica la competencia 'Facilita el Crecimiento del Cliente'?",
              options: [
                "Dar consejos y soluciones al cliente",
                "Colaborar con el cliente para transformar el aprendizaje en acción",
                "Analizar psicológicamente al cliente",
                "Establecer metas para el cliente"
              ],
              correctAnswer: 1,
              explanation: "La competencia 'Facilita el Crecimiento del Cliente' implica colaborar con el cliente para transformar el aprendizaje y el insight en acción, promoviendo la autonomía del cliente en el proceso de coaching."
            }
          ],
          passingScore: 70
        }
      }
    ]
  }
];

// Datos de módulos para el nivel 2
const modulesLevel2 = [
  {
    title: "Herramientas del Coaching Ontológico",
    description: "Exploración y práctica de las principales herramientas y técnicas utilizadas en el coaching ontológico para facilitar la transformación personal y profesional.",
    order: 1,
    sections: [
      {
        title: "Preguntas Poderosas",
        content: `<div class="section-content">
          <p>Las preguntas poderosas son una de las herramientas más importantes del coaching ontológico. A diferencia de las preguntas comunes, las preguntas poderosas tienen la capacidad de generar nuevas distinciones, abrir posibilidades y provocar reflexiones profundas que conducen a transformaciones en el observador.</p>
          
          <h3>Características de las Preguntas Poderosas</h3>
          <ul>
            <li><strong>Son abiertas:</strong> No pueden responderse con un simple "sí" o "no".</li>
            <li><strong>Son genuinas:</strong> El coach realmente no sabe la respuesta y está interesado en la exploración del cliente.</li>
            <li><strong>Son generativas:</strong> Crean nuevas posibilidades y perspectivas.</li>
            <li><strong>Son desafiantes:</strong> Cuestionan supuestos y creencias limitantes.</li>
            <li><strong>Son simples:</strong> Utilizan un lenguaje claro y directo.</li>
            <li><strong>Están orientadas al futuro:</strong> Promueven la acción y el movimiento hacia adelante.</li>
          </ul>
          
          <h3>Tipos de Preguntas Poderosas</h3>
          <ol>
            <li><strong>Preguntas de exploración:</strong> "¿Qué está sucediendo realmente en esta situación?"</li>
            <li><strong>Preguntas de perspectiva:</strong> "¿Cómo verías esta situación dentro de cinco años?"</li>
            <li><strong>Preguntas de valores:</strong> "¿Qué es lo más importante para ti en este momento?"</li>
            <li><strong>Preguntas de recursos:</strong> "¿Qué habilidades ya tienes que podrían ayudarte aquí?"</li>
            <li><strong>Preguntas de acción:</strong> "¿Cuál sería un primer paso pequeño pero significativo?"</li>
          </ol>
          
          <p>La efectividad de una pregunta poderosa no solo depende de su formulación, sino también del momento en que se hace, el tono utilizado y la presencia del coach. Una misma pregunta puede tener efectos muy diferentes dependiendo de estos factores contextuales.</p>
          
          <p>En el coaching ontológico, las preguntas poderosas se utilizan para trabajar en los tres dominios del ser: pueden explorar narrativas e interpretaciones (dominio lingüístico), indagar sobre emociones y estados de ánimo (dominio emocional), o dirigir la atención a sensaciones y disposiciones corporales (dominio corporal).</p>
        </div>`,
        videoUrl: "https://www.youtube.com/embed/43S9sPRbgnw",
        resources: [
          {
            title: "Plantilla para Diseño de Sesiones",
            url: "/recursos/plantilla_sesion.pdf",
            type: "pdf"
          },
          {
            title: "Video: Demostración de Preguntas Poderosas",
            url: "https://www.youtube.com/watch?v=43S9sPRbgnw",
            type: "video"
          }
        ],
        order: 1,
        quiz: {
          questions: [
            {
              text: "¿Cuál de las siguientes NO es una característica de las preguntas poderosas?",
              options: [
                "Son abiertas",
                "Son cerradas y pueden responderse con sí o no",
                "Son generativas",
                "Son desafiantes"
              ],
              correctAnswer: 1,
              explanation: "Las preguntas poderosas son abiertas, no cerradas. No pueden responderse con un simple 'sí' o 'no', ya que buscan generar reflexión y exploración profunda."
            },
            {
              text: "¿Qué tipo de pregunta poderosa sería '¿Cómo verías esta situación dentro de cinco años?'?",
              options: [
                "Pregunta de exploración",
                "Pregunta de perspectiva",
                "Pregunta de valores",
                "Pregunta de acción"
              ],
              correctAnswer: 1,
              explanation: "Esta es una pregunta de perspectiva, ya que invita al cliente a considerar la situación desde un punto de vista temporal diferente, ampliando su perspectiva actual."
            },
            {
              text: "En el coaching ontológico, las preguntas poderosas se utilizan para trabajar en:",
              options: [
                "Solo el dominio lingüístico",
                "Solo el dominio emocional",
                "Los tres dominios del ser: lingüístico, emocional y corporal",
                "Solo aspectos relacionados con la acción y los resultados"
              ],
              correctAnswer: 2,
              explanation: "En el coaching ontológico, las preguntas poderosas se utilizan para trabajar en los tres dominios del ser: pueden explorar narrativas e interpretaciones (dominio lingüístico), indagar sobre emociones y estados de ánimo (dominio emocional), o dirigir la atención a sensaciones y disposiciones corporales (dominio corporal)."
            }
          ],
          passingScore: 70
        }
      }
    ]
  },
  {
    title: "Práctica Supervisada",
    description: "Sesiones prácticas de coaching ontológico con supervisión y feedback de mentores experimentados para desarrollar habilidades y competencias.",
    order: 2,
    sections: [
      {
        title: "Sesión Demostrativa de Coaching Ontológico",
        content: `<div class="section-content">
          <p>A continuación, observarás una sesión completa de coaching ontológico conducida por un coach certificado. Esta sesión te permitirá ver en acción las competencias, herramientas y principios que hemos estudiado en los módulos anteriores.</p>
          
          <div class="key-concept">
            <h3>Guía de Observación</h3>
            <p>Mientras observas la sesión, presta especial atención a los siguientes aspectos:</p>
            <ul>
              <li><strong>Estructura de la sesión:</strong> ¿Cómo maneja el coach las diferentes fases de la sesión?</li>
              <li><strong>Presencia del coach:</strong> ¿Cómo se manifiesta la presencia del coach en los tres dominios?</li>
              <li><strong>Escucha activa:</strong> ¿Qué niveles de escucha puedes identificar?</li>
              <li><strong>Preguntas poderosas:</strong> ¿Qué tipos de preguntas utiliza el coach y qué efecto tienen en el cliente?</li>
              <li><strong>Trabajo con emociones:</strong> ¿Cómo aborda el coach el dominio emocional del cliente?</li>
              <li><strong>Corporalidad:</strong> ¿Cómo integra el coach el trabajo con el dominio corporal?</li>
              <li><strong>Distinciones ontológicas:</strong> ¿Qué distinciones ofrece el coach y cómo las introduce?</li>
              <li><strong>Diseño de acciones:</strong> ¿Cómo facilita el coach el diseño de acciones y compromisos?</li>
            </ul>
          </div>
          
          <p>Toma notas detalladas durante la observación. Estas notas serán la base para el análisis que realizaremos en la siguiente sección.</p>
          
          <div class="practice-exercise">
            <h3>Ejercicio Práctico: Registro de Observación</h3>
            <p>Utiliza la siguiente estructura para registrar tus observaciones de la sesión demostrativa:</p>
            <ol>
              <li><strong>Contexto de la sesión:</strong> Describe brevemente el tema y objetivo de la sesión.</li>
              <li><strong>Momentos clave:</strong> Identifica 3-5 momentos significativos de la sesión y describe qué los hizo importantes.</li>
              <li><strong>Competencias observadas:</strong> Para cada competencia de la ICF, anota ejemplos concretos de cómo el coach la demostró.</li>
              <li><strong>Preguntas poderosas:</strong> Registra las preguntas que te parecieron más efectivas y analiza por qué.</li>
              <li><strong>Trabajo con los tres dominios:</strong> Describe cómo el coach trabajó con el lenguaje, las emociones y la corporalidad del cliente.</li>
              <li><strong>Aprendizajes personales:</strong> ¿Qué aprendiste de esta sesión que puedas aplicar en tu propia práctica?</li>
            </ol>
          </div>
          
          <p>Este registro será un recurso valioso para tu desarrollo como coach ontológico. Te recomendamos revisarlo periódicamente y compararlo con tus propias sesiones de práctica.</p>
        </div>`,
        videoUrl: "https://www.youtube.com/embed/43S9sPRbgnw",
        resources: [
          {
            title: "Guía de Competencias ICF",
            url: "/recursos/guia_competencias_icf.pdf",
            type: "pdf"
          },
          {
            title: "Video: Sesión Completa de Coaching",
            url: "https://www.youtube.com/watch?v=43S9sPRbgnw",
            type: "video"
          }
        ],
        order: 1,
        quiz: {
          questions: [
            {
              text: "¿Cuál es el propósito principal de observar una sesión demostrativa de coaching ontológico?",
              options: [
                "Memorizar un guión para replicarlo exactamente",
                "Criticar el estilo del coach",
                "Ver en acción las competencias, herramientas y principios estudiados",
                "Aprender a hablar como el coach demostrador"
              ],
              correctAnswer: 2,
              explanation: "El propósito principal de observar una sesión demostrativa es ver en acción las competencias, herramientas y principios estudiados en los módulos teóricos, permitiendo integrar la teoría con la práctica."
            },
            {
              text: "Al observar una sesión de coaching, ¿qué aspecto NO se menciona específicamente en la guía de observación?",
              options: [
                "Estructura de la sesión",
                "Presencia del coach",
                "Personalidad del cliente",
                "Trabajo con emociones"
              ],
              correctAnswer: 2,
              explanation: "La personalidad del cliente no se menciona específicamente en la guía de observación. Los aspectos a observar se centran en la actuación del coach y la dinámica de la sesión, no en características personales del cliente."
            },
            {
              text: "¿Qué debe incluir un buen registro de observación de una sesión de coaching?",
              options: [
                "Solo los errores del coach para evitarlos",
                "Una transcripción palabra por palabra de toda la sesión",
                "Momentos clave, competencias observadas y aprendizajes personales",
                "Una evaluación numérica del desempeño del coach"
              ],
              correctAnswer: 2,
              explanation: "Un buen registro de observación debe incluir elementos como el contexto de la sesión, momentos clave, competencias observadas, preguntas poderosas identificadas, trabajo con los tres dominios y aprendizajes personales."
            }
          ],
          passingScore: 70
        }
      }
    ]
  }
];

// Datos de módulos para el nivel 3
const modulesLevel3 = [
  {
    title: "Maestría en Coaching Ontológico",
    description: "Desarrollo avanzado de habilidades y competencias para alcanzar la maestría en la práctica del coaching ontológico y preparación para la certificación profesional.",
    order: 1,
    sections: [
      {
        title: "Integración de los Tres Dominios",
        content: `<div class="section-content">
          <p>La maestría en coaching ontológico se caracteriza por la capacidad de integrar fluidamente los tres dominios del ser (lenguaje, emociones y corporalidad) durante el proceso de coaching. Esta integración permite abordar los desafíos del cliente de manera holística y generar transformaciones más profundas y sostenibles.</p>
          
          <h3>Integración Consciente</h3>
          <p>En niveles avanzados de práctica, el coach ontológico desarrolla la capacidad de observar simultáneamente los tres dominios, tanto en sí mismo como en el cliente. Esta observación múltiple permite:</p>
          <ul>
            <li>Detectar coherencias e incoherencias entre lo que el cliente dice, siente y expresa corporalmente</li>
            <li>Identificar patrones recurrentes que se manifiestan en los tres dominios</li>
            <li>Elegir conscientemente en qué dominio intervenir para generar el mayor impacto</li>
            <li>Utilizar el propio cuerpo, emociones y lenguaje como instrumentos de coaching</li>
          </ul>
          
          <h3>Prácticas para la Integración</h3>
          <ol>
            <li><strong>Presencia Integral:</strong> Cultivar la capacidad de estar plenamente presente con atención simultánea a los tres dominios.</li>
            <li><strong>Escucha Ontológica:</strong> Escuchar no solo las palabras, sino también las emociones subyacentes y las expresiones corporales.</li>
            <li><strong>Intervenciones Multidominio:</strong> Diseñar intervenciones que aborden simultáneamente los tres dominios.</li>
            <li><strong>Modelado Consciente:</strong> Utilizar el propio ser como modelo de coherencia entre lenguaje, emociones y corporalidad.</li>
            <li><strong>Feedback Integral:</strong> Ofrecer observaciones que integren los tres dominios.</li>
          </ol>
          
          <h3>Ejemplo de Integración en la Práctica</h3>
          <p>Imagina un cliente que expresa verbalmente su compromiso con un proyecto, pero su lenguaje corporal muestra tensión y su tono emocional revela ansiedad. Un coach con maestría podría:</p>
          <ul>
            <li>Hacer notar esta incoherencia de manera respetuosa</li>
            <li>Invitar al cliente a explorar la tensión corporal y qué información contiene</li>
            <li>Facilitar la identificación y expresión de la emoción subyacente</li>
            <li>Explorar las narrativas e interpretaciones que generan esa emoción</li>
            <li>Diseñar prácticas que integren nuevas formas de hablar, sentir y moverse en relación con el proyecto</li>
          </ul>
          
          <p>La maestría en la integración de los tres dominios no es un punto de llegada, sino un camino de desarrollo continuo. Incluso los coaches más experimentados siguen profundizando en su capacidad de trabajar integralmente con el lenguaje, las emociones y la corporalidad.</p>
        </div>`,
        videoUrl: "https://www.youtube.com/embed/EJkmOjffFwo",
        resources: [
          {
            title: "Guía de Competencias ICF",
            url: "/recursos/guia_competencias_icf.pdf",
            type: "pdf"
          },
          {
            title: "Video: Maestría en Coaching Ontológico",
            url: "https://www.youtube.com/watch?v=EJkmOjffFwo",
            type: "video"
          }
        ],
        order: 1,
        quiz: {
          questions: [
            {
              text: "¿Qué caracteriza la maestría en coaching ontológico según el contenido?",
              options: [
                "El dominio de técnicas avanzadas de PNL",
                "La capacidad de integrar fluidamente los tres dominios del ser",
                "La memorización de preguntas poderosas",
                "La capacidad de hablar más que el cliente"
              ],
              correctAnswer: 1,
              explanation: "La maestría en coaching ontológico se caracteriza por la capacidad de integrar fluidamente los tres dominios del ser (lenguaje, emociones y corporalidad) durante el proceso de coaching."
            },
            {
              text: "¿Qué permite la observación simultánea de los tres dominios?",
              options: [
                "Juzgar al cliente más efectivamente",
                "Detectar coherencias e incoherencias entre lo que el cliente dice, siente y expresa corporalmente",
                "Manipular al cliente hacia los objetivos del coach",
                "Evitar trabajar con emociones difíciles"
              ],
              correctAnswer: 1,
              explanation: "La observación simultánea de los tres dominios permite detectar coherencias e incoherencias entre lo que el cliente dice, siente y expresa corporalmente, identificar patrones recurrentes, elegir conscientemente en qué dominio intervenir, y utilizar el propio cuerpo, emociones y lenguaje como instrumentos de coaching."
            },
            {
              text: "Según el texto, la maestría en la integración de los tres dominios es:",
              options: [
                "Un punto de llegada definitivo",
                "Algo que solo pueden lograr coaches certificados",
                "Un camino de desarrollo continuo",
                "Una técnica específica que se aprende en un taller"
              ],
              correctAnswer: 2,
              explanation: "El texto indica que la maestría en la integración de los tres dominios no es un punto de llegada, sino un camino de desarrollo continuo. Incluso los coaches más experimentados siguen profundizando en su capacidad de trabajar integralmente con el lenguaje, las emociones y la corporalidad."
            }
          ],
          passingScore: 70
        }
      }
    ]
  }
];

// Función para migrar datos a la base de datos
async function migrateData() {
  try {
    // Limpiar colecciones existentes
    await User.deleteMany({});
    await Subscription.deleteMany({});
    await Course.deleteMany({});
    await Module.deleteMany({});
    await Section.deleteMany({});
    await Quiz.deleteMany({});
    
    console.log('Colecciones limpiadas');
    
    // Crear usuarios de prueba
    const hashedPassword1 = await bcrypt.hash('curso123', 10);
    const hashedPassword2 = await bcrypt.hash('admin123', 10);
    
    const student = await User.create({
      username: 'estudiante',
      email: 'estudiante@ejemplo.com',
      password: hashedPassword1,
      name: 'Estudiante Prueba',
      role: 'student',
      registrationDate: new Date(),
      lastLogin: new Date()
    });
    
    const admin = await User.create({
      username: 'admin',
      email: 'admin@coachingontologico.com',
      password: hashedPassword2,
      name: 'Administrador',
      role: 'admin',
      registrationDate: new Date(),
      lastLogin: new Date()
    });
    
    console.log('Usuarios creados');
    
    // Crear cursos
    const createdCourses = [];
    for (const courseData of coursesData) {
      const course = await Course.create({
        level: courseData.level,
        title: courseData.title,
        description: courseData.description,
        price: courseData.price,
        modules: []
      });
      createdCourses.push(course);
    }
    
    console.log('Cursos creados');
    
    // Crear módulos y secciones para el nivel 1
    for (const moduleData of modulesLevel1) {
      const module = await Module.create({
        courseId: createdCourses[0]._id,
        title: moduleData.title,
        description: moduleData.description,
        order: moduleData.order,
        sections: []
      });
      
      // Actualizar el curso con el ID del módulo
      await Course.findByIdAndUpdate(
        createdCourses[0]._id,
        { $push: { modules: module._id } }
      );
      
      // Crear secciones para este módulo
      for (const sectionData of moduleData.sections) {
        const section = await Section.create({
          moduleId: module._id,
          title: sectionData.title,
          content: sectionData.content,
          videoUrl: sectionData.videoUrl,
          resources: sectionData.resources,
          order: sectionData.order
        });
        
        // Actualizar el módulo con el ID de la sección
        await Module.findByIdAndUpdate(
          module._id,
          { $push: { sections: section._id } }
        );
        
        // Crear quiz para esta sección si existe
        if (sectionData.quiz) {
          const quiz = await Quiz.create({
            sectionId: section._id,
            questions: sectionData.quiz.questions,
            passingScore: sectionData.quiz.passingScore
          });
        }
      }
    }
    
    console.log('Módulos y secciones para nivel 1 creados');
    
    // Crear módulos y secciones para el nivel 2
    for (const moduleData of modulesLevel2) {
      const module = await Module.create({
        courseId: createdCourses[1]._id,
        title: moduleData.title,
        description: moduleData.description,
        order: moduleData.order,
        sections: []
      });
      
      // Actualizar el curso con el ID del módulo
      await Course.findByIdAndUpdate(
        createdCourses[1]._id,
        { $push: { modules: module._id } }
      );
      
      // Crear secciones para este módulo
      for (const sectionData of moduleData.sections) {
        const section = await Section.create({
          moduleId: module._id,
          title: sectionData.title,
          content: sectionData.content,
          videoUrl: sectionData.videoUrl,
          resources: sectionData.resources,
          order: sectionData.order
        });
        
        // Actualizar el módulo con el ID de la sección
        await Module.findByIdAndUpdate(
          module._id,
          { $push: { sections: section._id } }
        );
        
        // Crear quiz para esta sección si existe
        if (sectionData.quiz) {
          const quiz = await Quiz.create({
            sectionId: section._id,
            questions: sectionData.quiz.questions,
            passingScore: sectionData.quiz.passingScore
          });
        }
      }
    }
    
    console.log('Módulos y secciones para nivel 2 creados');
    
    // Crear módulos y secciones para el nivel 3
    for (const moduleData of modulesLevel3) {
      const module = await Module.create({
        courseId: createdCourses[2]._id,
        title: moduleData.title,
        description: moduleData.description,
        order: moduleData.order,
        sections: []
      });
      
      // Actualizar el curso con el ID del módulo
      await Course.findByIdAndUpdate(
        createdCourses[2]._id,
        { $push: { modules: module._id } }
      );
      
      // Crear secciones para este módulo
      for (const sectionData of moduleData.sections) {
        const section = await Section.create({
          moduleId: module._id,
          title: sectionData.title,
          content: sectionData.content,
          videoUrl: sectionData.videoUrl,
          resources: sectionData.resources,
          order: sectionData.order
        });
        
        // Actualizar el módulo con el ID de la sección
        await Module.findByIdAndUpdate(
          module._id,
          { $push: { sections: section._id } }
        );
        
        // Crear quiz para esta sección si existe
        if (sectionData.quiz) {
          const quiz = await Quiz.create({
            sectionId: section._id,
            questions: sectionData.quiz.questions,
            passingScore: sectionData.quiz.passingScore
          });
        }
      }
    }
    
    console.log('Módulos y secciones para nivel 3 creados');
    
    // Crear suscripciones
    await Subscription.create({
      userId: student._id,
      courseLevel: 1,
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      status: 'active',
      paymentInfo: {
        amount: 497,
        method: 'credit_card',
        date: new Date()
      }
    });
    
    await Subscription.create({
      userId: admin._id,
      courseLevel: 3,
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      status: 'active',
      paymentInfo: {
        amount: 2497,
        method: 'credit_card',
        date: new Date()
      }
    });
    
    console.log('Suscripciones creadas');
    
    console.log('Migración completada exitosamente');
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Ejecutar migración
migrateData();
