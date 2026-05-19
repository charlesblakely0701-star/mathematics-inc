import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SEED_PASSWORD = "theorem1234";

const mathematicians = [
  {
    email: "emmy.noether@math-inc.example",
    name: "Emmy Noether",
    title: "Professor of Abstract Algebra",
    department: "Algebra",
    bio: "Working on abstract algebra and the relationship between symmetry and conservation laws. Author of Noether's theorem, which underpins much of modern theoretical physics.",
    researchInterests: ["ring theory", "group theory", "invariant theory", "Noether's theorem"],
    websiteUrl: "",
    favoriteTheorem:
      "\\text{Every differentiable symmetry of the action of a physical system has a corresponding conservation law.}",
  },
  {
    email: "srinivasa.ramanujan@math-inc.example",
    name: "Srinivasa Ramanujan",
    title: "Research Fellow",
    department: "Number Theory",
    bio: "Self-taught mathematician with an extraordinary intuition for numbers. Currently exploring infinite series, continued fractions, and partition functions. My notebooks are always open.",
    researchInterests: ["partition functions", "infinite series", "mock theta functions", "highly composite numbers"],
    websiteUrl: "",
    favoriteTheorem:
      "1 + 2 + 3 + \\cdots = -\\frac{1}{12} \\quad \\text{(analytic continuation)}",
  },
  {
    email: "carl.gauss@math-inc.example",
    name: "Carl Friedrich Gauss",
    title: "Director of the Number Theory Division",
    department: "Number Theory",
    bio: "Interested in everything from the distribution of primes to the geometry of curved surfaces. Currently revisiting the law of quadratic reciprocity for the fifth time.",
    researchInterests: ["prime distribution", "quadratic reciprocity", "differential geometry", "complex analysis"],
    websiteUrl: "",
    favoriteTheorem: "e^{i\\pi} + 1 = 0",
  },
  {
    email: "maryam.mirzakhani@math-inc.example",
    name: "Maryam Mirzakhani",
    title: "Senior Researcher",
    department: "Geometry & Topology",
    bio: "Exploring the geometry of Riemann surfaces and their moduli spaces. Particularly interested in the dynamics and geometry of Teichmüller spaces.",
    researchInterests: ["Riemann surfaces", "moduli spaces", "Teichmüller theory", "hyperbolic geometry"],
    websiteUrl: "",
    favoriteTheorem: "A = \\pi r^2",
  },
  {
    email: "alan.turing@math-inc.example",
    name: "Alan Turing",
    title: "Head of Computation & Logic",
    department: "Logic & Foundations",
    bio: "Thinking about what it means for a function to be computable. Also moonlighting on pattern formation in biological systems — reaction-diffusion equations are fascinating.",
    researchInterests: ["computability theory", "Turing machines", "morphogenesis", "cryptanalysis"],
    websiteUrl: "",
    favoriteTheorem: "\\exists \\, \\text{computable functions that are not primitive recursive.}",
  },
  {
    email: "sofya.kovalevskaya@math-inc.example",
    name: "Sofya Kovalevskaya",
    title: "Associate Professor",
    department: "Analysis",
    bio: "Working on the rotation of a rigid body around a fixed point and partial differential equations. Co-author of the Cauchy–Kovalevskaya theorem.",
    researchInterests: ["partial differential equations", "rigid body dynamics", "Abelian integrals", "Cauchy-Kovalevskaya theorem"],
    websiteUrl: "",
    favoriteTheorem: null,
  },
  {
    email: "paul.erdos@math-inc.example",
    name: "Paul Erdős",
    title: "Visiting Collaborator",
    department: "Combinatorics",
    bio: "No permanent address — I travel from mathematician to mathematician. My suitcase contains everything I need. If you have a good problem, I am already on my way.",
    researchInterests: ["graph theory", "combinatorics", "Ramsey theory", "prime numbers", "probabilistic method"],
    websiteUrl: "",
    favoriteTheorem: "\\sum_{p \\leq x} \\log p \\sim x",
  },
  {
    email: "katherine.johnson@math-inc.example",
    name: "Katherine Johnson",
    title: "Lead Applied Mathematician",
    department: "Applied Mathematics",
    bio: "Specializing in orbital mechanics and trajectory analysis. If the numbers say it will work, it will work. I have always loved math — it is always right.",
    researchInterests: ["orbital mechanics", "numerical analysis", "trajectory calculation", "celestial mechanics"],
    websiteUrl: "",
    favoriteTheorem: "F = G\\frac{m_1 m_2}{r^2}",
  },
];

async function main() {
  console.log("Seeding database with demo mathematicians...");

  const hash = await bcrypt.hash(SEED_PASSWORD, 10);

  for (const m of mathematicians) {
    await prisma.user.upsert({
      where: { email: m.email },
      update: {
        name: m.name,
        title: m.title,
        department: m.department,
        bio: m.bio,
        researchInterests: m.researchInterests,
        websiteUrl: m.websiteUrl || null,
        favoriteTheorem: m.favoriteTheorem,
      },
      create: {
        email: m.email,
        passwordHash: hash,
        name: m.name,
        title: m.title,
        department: m.department,
        bio: m.bio,
        researchInterests: m.researchInterests,
        websiteUrl: m.websiteUrl || null,
        favoriteTheorem: m.favoriteTheorem,
        emailVerified: new Date(),
      },
    });
    console.log(`  ✓ ${m.name}`);
  }

  console.log(`\nDone! All ${mathematicians.length} mathematicians seeded.`);
  console.log(`Password for all demo accounts: ${SEED_PASSWORD}`);
  console.log(
    "Tip: sign in as carl.gauss@math-inc.example to see Euler's identity rendered with KaTeX.",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
