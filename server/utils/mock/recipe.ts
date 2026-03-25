import {
  RecipeDifficulty,
  type IRecipeProcessNode,
  type IRecipeSchema,
} from "../../../shared/types/recipe"

const CREATED_AT = "2026-03-26T00:00:00.000Z"

type NodeInput = Omit<IRecipeProcessNode, "id">

function createRecipeBuilder() {
  let nextNodeId = 1

  const createNode = (node: NodeInput): IRecipeProcessNode => ({
    id: nextNodeId++,
    ...node,
  })

  const connect = (from: IRecipeProcessNode, to: IRecipeProcessNode): IRecipeProcessNode => {
    from.next = to
    return from
  }

  return { createNode, connect }
}

function collectStackNodes(stack: IRecipeProcessNode[]): IRecipeProcessNode[] {
  const visited = new Set<number>()
  const visiting = new Set<number>()
  const nodes: IRecipeProcessNode[] = []

  const walk = (node: IRecipeProcessNode | undefined) => {
    if (!node || visited.has(node.id)) {
      return
    }
    if (visiting.has(node.id)) {
      throw new Error(`Detected next-cycle at node ${node.id}`)
    }

    visiting.add(node.id)
    visited.add(node.id)
    nodes.push(node)
    walk(node.next)
    visiting.delete(node.id)
  }

  for (const head of stack) {
    walk(head)
  }

  return nodes
}

function validateRecipeSchema(recipe: IRecipeSchema): void {
  const errors: string[] = []

  for (const [stackName, stack] of [["prepare", recipe.prepare], ["process", recipe.process]] as const) {
    if (!stack) {
      continue
    }

    const nodes = collectStackNodes(stack)
    const nodeIds = new Set<number>()

    for (const node of nodes) {
      if (nodeIds.has(node.id)) {
        errors.push(`Duplicate node id ${node.id} in ${recipe.meta.id}:${stackName}`)
      }
      nodeIds.add(node.id)
    }

    for (const node of nodes) {
      for (const prevId of node.prev ?? []) {
        if (!nodeIds.has(prevId)) {
          errors.push(
            `Invalid prev reference ${prevId} in ${recipe.meta.id}:${stackName}; prev must stay inside current stack`,
          )
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join("\n"))
  }
}

function createTomatoEggRecipe(): IRecipeSchema {
  const { createNode, connect } = createRecipeBuilder()

  const cutTomato = createNode({
    title: "切番茄",
    description: "番茄切成滚刀块。",
    durationMinutes: 2,
    ingredients: [{ name: "番茄", count: { value: 2, unit: "个" } }],
    intermediateIngredients: [{ name: "番茄块", count: { value: 2, unit: "个" } }],
  })

  const chopScallion = createNode({
    title: "切葱花",
    description: "小葱切成葱花。",
    durationMinutes: 1,
    ingredients: [{ name: "小葱", count: { value: 1, unit: "根" } }],
    intermediateIngredients: [{ name: "葱花", count: { value: 1, unit: "份" } }],
  })

  const crackEggs = createNode({
    title: "打入鸡蛋",
    description: "鸡蛋打入碗中。",
    durationMinutes: 1,
    ingredients: [{ name: "鸡蛋", count: { value: 4, unit: "个" } }],
    equipment: [{ name: "碗", group: "处理" }],
  })

  const seasonEggs = createNode({
    title: "加入蛋液盐",
    description: "加入 1 克盐。",
    durationMinutes: 1,
    ingredients: [{ name: "盐", count: { value: 1, unit: "克" } }],
    equipment: [{ name: "碗", group: "处理" }],
  })

  const beatEggs = createNode({
    title: "打散蛋液",
    description: "把鸡蛋打散成均匀蛋液。",
    durationMinutes: 1,
    equipment: [{ name: "碗", group: "处理" }],
    intermediateIngredients: [{ name: "蛋液", count: { value: 1, unit: "碗" } }],
  })

  const heatWok = createNode({
    title: "中火热锅",
    description: "中火把炒锅烧热。",
    durationMinutes: 1,
    prev: [cutTomato.id, chopScallion.id, beatEggs.id],
    equipment: [{ name: "炒锅", group: "加热" }],
  })

  const addOilForEgg = createNode({
    title: "倒入蛋用油",
    description: "倒入一半食用油。",
    durationMinutes: 1,
    ingredients: [{ name: "食用油", count: { value: 10, unit: "毫升" } }],
    equipment: [{ name: "炒锅", group: "加热" }],
  })

  const pourEgg = createNode({
    title: "倒入蛋液",
    description: "把蛋液倒入锅中。",
    durationMinutes: 1,
    ingredients: [{ name: "蛋液", count: { value: 1, unit: "碗" } }],
    equipment: [{ name: "炒锅", group: "加热" }],
  })

  const scrambleEgg = createNode({
    title: "滑炒鸡蛋",
    description: "用锅铲轻推蛋液到八成熟。",
    durationMinutes: 1,
    equipment: [{ name: "锅铲", group: "加热" }],
    intermediateIngredients: [{ name: "滑炒鸡蛋", count: { value: 1, unit: "份" } }],
  })

  const removeEgg = createNode({
    title: "盛出鸡蛋",
    description: "把滑炒鸡蛋盛出备用。",
    durationMinutes: 1,
    ingredients: [{ name: "滑炒鸡蛋", count: { value: 1, unit: "份" } }],
  })

  const addOilForTomato = createNode({
    title: "补入底油",
    description: "锅里补入剩余食用油。",
    durationMinutes: 1,
    ingredients: [{ name: "食用油", count: { value: 10, unit: "毫升" } }],
    equipment: [{ name: "炒锅", group: "加热" }],
  })

  const addTomato = createNode({
    title: "下番茄块",
    description: "把番茄块下入锅中。",
    durationMinutes: 1,
    ingredients: [{ name: "番茄块", count: { value: 2, unit: "个" } }],
    equipment: [{ name: "炒锅", group: "加热" }],
  })

  const fryTomato = createNode({
    title: "炒出番茄汁",
    description: "把番茄炒到边缘发软并开始出汁。",
    durationMinutes: 2,
    equipment: [{ name: "锅铲", group: "加热" }],
    intermediateIngredients: [{ name: "出汁番茄", count: { value: 1, unit: "份" } }],
  })

  const seasonTomato = createNode({
    title: "加入调味料",
    description: "加入剩余盐和白糖。",
    durationMinutes: 1,
    ingredients: [
      { name: "盐", count: { value: 3, unit: "克" } },
      { name: "白糖", count: { value: 3, unit: "克" } },
    ],
  })

  const combineEgg = createNode({
    title: "倒回鸡蛋",
    description: "把鸡蛋倒回锅中。",
    durationMinutes: 1,
    ingredients: [{ name: "滑炒鸡蛋", count: { value: 1, unit: "份" } }],
  })

  const foldDish = createNode({
    title: "翻匀成菜",
    description: "把鸡蛋和番茄翻匀。",
    durationMinutes: 1,
    equipment: [{ name: "锅铲", group: "加热" }],
  })

  const addScallion = createNode({
    title: "撒入葱花",
    description: "撒入葱花。",
    durationMinutes: 1,
    ingredients: [{ name: "葱花", count: { value: 1, unit: "份" } }],
  })

  const plateDish = createNode({
    title: "装盘",
    description: "把西红柿炒鸡蛋装盘。",
    durationMinutes: 1,
  })

  connect(cutTomato, chopScallion)
  connect(chopScallion, crackEggs)
  connect(crackEggs, seasonEggs)
  connect(seasonEggs, beatEggs)
  connect(heatWok, addOilForEgg)
  connect(addOilForEgg, pourEgg)
  connect(pourEgg, scrambleEgg)
  connect(scrambleEgg, removeEgg)
  connect(removeEgg, addOilForTomato)
  connect(addOilForTomato, addTomato)
  connect(addTomato, fryTomato)
  connect(fryTomato, seasonTomato)
  connect(seasonTomato, combineEgg)
  connect(combineEgg, foldDish)
  connect(foldDish, addScallion)
  connect(addScallion, plateDish)

  return {
    meta: {
      id: "tomato-scrambled-eggs",
      name: "西红柿炒鸡蛋",
      description: "真实家常做法的番茄炒蛋，节奏清楚，适合工作日晚餐。",
      ingredients: [
        { name: "番茄", count: { value: 2, unit: "个" } },
        { name: "鸡蛋", count: { value: 4, unit: "个" } },
        { name: "小葱", count: { value: 1, unit: "根" }, optional: true },
        { name: "盐", count: { value: 4, unit: "克" } },
        { name: "白糖", count: { value: 3, unit: "克" }, optional: true },
        { name: "食用油", count: { value: 20, unit: "毫升" } },
      ],
      equipment: [
        { name: "炒锅", group: "加热" },
        { name: "锅铲", group: "加热" },
        { name: "碗", group: "处理" },
      ],
      tags: ["家常菜", "快手菜", "番茄", "鸡蛋"],
      coverImageUrl: "/images/recipes/tomato-scrambled-eggs.jpg",
      servings: 2,
      difficulty: RecipeDifficulty.Easy,
      author: "Cookingo Mock",
      source: "Mock Data",
      createdAt: CREATED_AT,
      updatedAt: CREATED_AT,
    },
    process: [cutTomato, heatWok],
  }
}

function createColaWingsRecipe(): IRecipeSchema {
  const { createNode, connect } = createRecipeBuilder()

  const scoreWings = createNode({
    title: "划刀鸡翅",
    description: "鸡翅两面各划两刀。",
    durationMinutes: 3,
    ingredients: [{ name: "鸡中翅", count: { value: 8, unit: "个" } }],
    intermediateIngredients: [{ name: "划刀鸡翅", count: { value: 8, unit: "个" } }],
  })

  const addCookingWine = createNode({
    title: "加入料酒",
    description: "把料酒倒在鸡翅上。",
    durationMinutes: 1,
    ingredients: [{ name: "料酒", count: { value: 15, unit: "毫升" } }],
  })

  const addGingerForMarinade = createNode({
    title: "加入姜片",
    description: "加入一半姜片。",
    durationMinutes: 1,
    ingredients: [{ name: "姜", count: { value: 3, unit: "片" } }],
  })

  const mixMarinade = createNode({
    title: "抓匀鸡翅",
    description: "把鸡翅和腌料抓匀。",
    durationMinutes: 1,
    intermediateIngredients: [{ name: "调味鸡翅", count: { value: 8, unit: "个" } }],
  })

  const marinateWings = createNode({
    title: "腌制鸡翅",
    description: "静置鸡翅 15 分钟。",
    async: { waitMinutes: 15 },
    intermediateIngredients: [{ name: "腌好的鸡翅", count: { value: 8, unit: "个" } }],
  })

  const heatPan = createNode({
    title: "中火热锅",
    description: "中火把平底锅烧热。",
    durationMinutes: 1,
    equipment: [{ name: "平底锅", group: "加热" }],
  })

  const addOil = createNode({
    title: "倒入食用油",
    description: "倒入食用油。",
    durationMinutes: 1,
    ingredients: [{ name: "食用油", count: { value: 10, unit: "毫升" } }],
    equipment: [{ name: "平底锅", group: "加热" }],
  })

  const addWings = createNode({
    title: "下入鸡翅",
    description: "把鸡翅平码入锅中。",
    durationMinutes: 1,
    ingredients: [{ name: "腌好的鸡翅", count: { value: 8, unit: "个" } }],
  })

  const brownFirstSide = createNode({
    title: "煎第一面",
    description: "把鸡翅第一面煎到金黄。",
    durationMinutes: 3,
    equipment: [{ name: "锅铲", group: "加热" }],
  })

  const turnWings = createNode({
    title: "翻面鸡翅",
    description: "把鸡翅逐个翻面。",
    durationMinutes: 1,
    equipment: [{ name: "锅铲", group: "加热" }],
  })

  const brownSecondSide = createNode({
    title: "煎第二面",
    description: "把鸡翅另一面煎到金黄。",
    durationMinutes: 3,
    equipment: [{ name: "锅铲", group: "加热" }],
  })

  const addGingerForPan = createNode({
    title: "放入姜片",
    description: "放入剩余姜片。",
    durationMinutes: 1,
    ingredients: [{ name: "姜", count: { value: 3, unit: "片" } }],
  })

  const fryGinger = createNode({
    title: "炒香姜片",
    description: "把姜片炒出香味。",
    durationMinutes: 1,
    equipment: [{ name: "锅铲", group: "加热" }],
  })

  const addSoySauce = createNode({
    title: "倒入生抽",
    description: "把生抽淋入锅中。",
    durationMinutes: 1,
    ingredients: [{ name: "生抽", count: { value: 20, unit: "毫升" } }],
  })

  const addCola = createNode({
    title: "倒入可乐",
    description: "把可乐倒入锅中。",
    durationMinutes: 1,
    ingredients: [{ name: "可乐", count: { value: 330, unit: "毫升" } }],
    tips: ["液面以基本没过鸡翅为宜。"],
  })

  const boilSauce = createNode({
    title: "大火煮开",
    description: "把锅中汤汁煮开。",
    durationMinutes: 2,
  })

  const lowerHeat = createNode({
    title: "转中小火",
    description: "把火力转成中小火。",
    durationMinutes: 1,
  })

  const coverPan = createNode({
    title: "盖锅盖",
    description: "给锅盖上锅盖。",
    durationMinutes: 1,
    equipment: [{ name: "平底锅", group: "加热" }],
  })

  const simmerWings = createNode({
    title: "焖煮鸡翅",
    description: "焖煮鸡翅 15 分钟。",
    async: { waitMinutes: 15 },
  })

  const uncoverPan = createNode({
    title: "打开锅盖",
    description: "把锅盖打开。",
    durationMinutes: 1,
  })

  const reduceSauce = createNode({
    title: "大火收汁",
    description: "把汤汁收浓到能包住鸡翅。",
    durationMinutes: 3,
    equipment: [{ name: "锅铲", group: "加热" }],
  })

  const plateWings = createNode({
    title: "装盘",
    description: "把可乐鸡翅装盘。",
    durationMinutes: 1,
  })

  connect(scoreWings, addCookingWine)
  connect(addCookingWine, addGingerForMarinade)
  connect(addGingerForMarinade, mixMarinade)
  connect(mixMarinade, marinateWings)
  connect(heatPan, addOil)
  connect(addOil, addWings)
  connect(addWings, brownFirstSide)
  connect(brownFirstSide, turnWings)
  connect(turnWings, brownSecondSide)
  connect(brownSecondSide, addGingerForPan)
  connect(addGingerForPan, fryGinger)
  connect(fryGinger, addSoySauce)
  connect(addSoySauce, addCola)
  connect(addCola, boilSauce)
  connect(boilSauce, lowerHeat)
  connect(lowerHeat, coverPan)
  connect(coverPan, simmerWings)
  connect(simmerWings, uncoverPan)
  connect(uncoverPan, reduceSauce)
  connect(reduceSauce, plateWings)

  return {
    meta: {
      id: "cola-chicken-wings",
      name: "可乐鸡翅",
      description: "真实家常焖烧流程的可乐鸡翅，适合新手按步照做。",
      ingredients: [
        { name: "鸡中翅", count: { value: 8, unit: "个" } },
        { name: "可乐", count: { value: 330, unit: "毫升" } },
        { name: "姜", count: { value: 6, unit: "片" } },
        { name: "生抽", count: { value: 20, unit: "毫升" } },
        { name: "料酒", count: { value: 15, unit: "毫升" } },
        { name: "食用油", count: { value: 10, unit: "毫升" } },
      ],
      equipment: [
        { name: "平底锅", group: "加热" },
        { name: "锅铲", group: "加热" },
      ],
      tags: ["家常菜", "鸡翅", "焖烧", "甜口"],
      coverImageUrl: "/images/recipes/cola-chicken-wings.jpg",
      servings: 2,
      difficulty: RecipeDifficulty.Easy,
      author: "Cookingo Mock",
      source: "Mock Data",
      createdAt: CREATED_AT,
      updatedAt: CREATED_AT,
    },
    process: [scoreWings, heatPan],
  }
}

function createGarlicBroccoliRecipe(): IRecipeSchema {
  const { createNode, connect } = createRecipeBuilder()

  const breakBroccoli = createNode({
    title: "掰西兰花",
    description: "把西兰花掰成小朵。",
    durationMinutes: 2,
    ingredients: [{ name: "西兰花", count: { value: 1, unit: "颗" } }],
    intermediateIngredients: [{ name: "西兰花小朵", count: { value: 1, unit: "份" } }],
  })

  const rinseBroccoli = createNode({
    title: "冲洗西兰花",
    description: "把西兰花小朵冲洗干净。",
    durationMinutes: 1,
    ingredients: [{ name: "西兰花小朵", count: { value: 1, unit: "份" } }],
  })

  const drainBroccoli = createNode({
    title: "沥水西兰花",
    description: "把西兰花表面明水沥掉。",
    durationMinutes: 1,
    ingredients: [{ name: "西兰花小朵", count: { value: 1, unit: "份" } }],
  })

  const minceGarlic = createNode({
    title: "切蒜末",
    description: "把大蒜切成蒜末。",
    durationMinutes: 2,
    ingredients: [{ name: "大蒜", count: { value: 5, unit: "瓣" } }],
    intermediateIngredients: [{ name: "蒜末", count: { value: 1, unit: "份" } }],
  })

  const boilWater = createNode({
    title: "烧开焯菜水",
    description: "锅里烧开一锅水。",
    durationMinutes: 2,
    prev: [drainBroccoli.id, minceGarlic.id],
    equipment: [{ name: "汤锅", group: "加热" }],
  })

  const seasonBlanchWater = createNode({
    title: "加入焯水调料",
    description: "往水里加入 2 克盐和少许食用油。",
    durationMinutes: 1,
    ingredients: [
      { name: "盐", count: { value: 2, unit: "克" } },
      { name: "食用油", count: { value: 5, unit: "毫升" } },
    ],
  })

  const blanchBroccoli = createNode({
    title: "下锅焯菜",
    description: "把西兰花下锅焯 1 分钟。",
    durationMinutes: 1,
    ingredients: [{ name: "西兰花小朵", count: { value: 1, unit: "份" } }],
    intermediateIngredients: [{ name: "焯好的西兰花", count: { value: 1, unit: "份" } }],
  })

  const liftBroccoli = createNode({
    title: "捞出西兰花",
    description: "把西兰花捞出。",
    durationMinutes: 1,
    ingredients: [{ name: "焯好的西兰花", count: { value: 1, unit: "份" } }],
  })

  const heatWok = createNode({
    title: "中火热锅",
    description: "中火把炒锅烧热。",
    durationMinutes: 1,
    equipment: [{ name: "炒锅", group: "加热" }],
  })

  const addWokOil = createNode({
    title: "倒入炒菜油",
    description: "倒入炒菜用的食用油。",
    durationMinutes: 1,
    ingredients: [{ name: "食用油", count: { value: 10, unit: "毫升" } }],
  })

  const sauteGarlic = createNode({
    title: "下蒜末",
    description: "把蒜末下入锅中。",
    durationMinutes: 1,
    ingredients: [{ name: "蒜末", count: { value: 1, unit: "份" } }],
  })

  const fryGarlic = createNode({
    title: "炒香蒜末",
    description: "把蒜末炒到刚出香味。",
    durationMinutes: 1,
    equipment: [{ name: "锅铲", group: "加热" }],
  })

  const addBroccoli = createNode({
    title: "倒入西兰花",
    description: "把焯好的西兰花倒入锅中。",
    durationMinutes: 1,
    prev: [liftBroccoli.id, fryGarlic.id],
    ingredients: [{ name: "焯好的西兰花", count: { value: 1, unit: "份" } }],
  })

  const stirBroccoli = createNode({
    title: "翻炒西兰花",
    description: "大火翻炒西兰花。",
    durationMinutes: 1,
    equipment: [{ name: "锅铲", group: "加热" }],
  })

  const seasonBroccoli = createNode({
    title: "加入剩余盐",
    description: "加入剩余 2 克盐。",
    durationMinutes: 1,
    ingredients: [{ name: "盐", count: { value: 2, unit: "克" } }],
  })

  const finishBroccoli = createNode({
    title: "装盘",
    description: "把蒜蓉西兰花装盘。",
    durationMinutes: 1,
    tips: ["蒜末刚出香味就下西兰花，能避免蒜末发苦。"],
  })

  connect(breakBroccoli, rinseBroccoli)
  connect(rinseBroccoli, drainBroccoli)
  connect(boilWater, seasonBlanchWater)
  connect(seasonBlanchWater, blanchBroccoli)
  connect(blanchBroccoli, liftBroccoli)
  connect(heatWok, addWokOil)
  connect(addWokOil, sauteGarlic)
  connect(sauteGarlic, fryGarlic)
  connect(addBroccoli, stirBroccoli)
  connect(stirBroccoli, seasonBroccoli)
  connect(seasonBroccoli, finishBroccoli)

  return {
    meta: {
      id: "garlic-broccoli",
      name: "蒜蓉西兰花",
      description: "可直接照做的清爽蔬菜菜谱，火候和顺序都按家常做法整理。",
      ingredients: [
        { name: "西兰花", count: { value: 1, unit: "颗" } },
        { name: "大蒜", count: { value: 5, unit: "瓣" } },
        { name: "盐", count: { value: 4, unit: "克" } },
        { name: "食用油", count: { value: 15, unit: "毫升" } },
      ],
      equipment: [
        { name: "汤锅", group: "加热" },
        { name: "炒锅", group: "加热" },
        { name: "锅铲", group: "加热" },
      ],
      tags: ["素菜", "快手菜", "西兰花", "清淡"],
      coverImageUrl: "/images/recipes/garlic-broccoli.jpg",
      servings: 2,
      difficulty: RecipeDifficulty.Easy,
      author: "Cookingo Mock",
      source: "Mock Data",
      createdAt: CREATED_AT,
      updatedAt: CREATED_AT,
    },
    process: [breakBroccoli, minceGarlic, boilWater, heatWok],
  }
}

function createBeefStewRecipe(): IRecipeSchema {
  const { createNode, connect } = createRecipeBuilder()

  const beefToPot = createNode({
    title: "牛腩冷水下锅",
    description: "把牛腩放进冷水锅里。",
    durationMinutes: 1,
    ingredients: [{ name: "牛腩", count: { value: 500, unit: "克" } }],
    equipment: [{ name: "炖锅", group: "加热" }],
  })

  const addBlanchWine = createNode({
    title: "加入料酒",
    description: "往焯水锅里加入料酒。",
    durationMinutes: 1,
    ingredients: [{ name: "料酒", count: { value: 20, unit: "毫升" } }],
  })

  const addBlanchGinger = createNode({
    title: "加入焯水姜片",
    description: "往焯水锅里加入 2 片姜。",
    durationMinutes: 1,
    ingredients: [{ name: "姜", count: { value: 2, unit: "片" } }],
  })

  const boilBeef = createNode({
    title: "煮开牛腩",
    description: "把锅里的牛腩煮开。",
    durationMinutes: 4,
    equipment: [{ name: "炖锅", group: "加热" }],
  })

  const skimFoam = createNode({
    title: "撇去浮沫",
    description: "把表面的浮沫撇掉。",
    durationMinutes: 2,
    equipment: [{ name: "勺", group: "加热" }],
  })

  const rinseBeef = createNode({
    title: "冲洗牛腩",
    description: "把牛腩捞出冲洗干净。",
    durationMinutes: 2,
    intermediateIngredients: [{ name: "焯好的牛腩", count: { value: 500, unit: "克" } }],
  })

  const cutPotato = createNode({
    title: "切土豆",
    description: "把土豆切成滚刀块。",
    durationMinutes: 2,
    ingredients: [{ name: "土豆", count: { value: 2, unit: "个" } }],
    intermediateIngredients: [{ name: "土豆块", count: { value: 2, unit: "个" } }],
  })

  const soakPotato = createNode({
    title: "浸泡土豆",
    description: "把土豆块放入清水中。",
    durationMinutes: 1,
    ingredients: [{ name: "土豆块", count: { value: 2, unit: "个" } }],
  })

  const cutCarrot = createNode({
    title: "切胡萝卜",
    description: "把胡萝卜切成滚刀块。",
    durationMinutes: 2,
    ingredients: [{ name: "胡萝卜", count: { value: 1, unit: "根" } }],
    intermediateIngredients: [{ name: "胡萝卜块", count: { value: 1, unit: "根" } }],
  })

  const sliceGinger = createNode({
    title: "切姜片",
    description: "把剩余姜切成姜片。",
    durationMinutes: 1,
    ingredients: [{ name: "姜", count: { value: 4, unit: "片" } }],
    intermediateIngredients: [{ name: "姜片", count: { value: 4, unit: "片" } }],
  })

  const heatWok = createNode({
    title: "中火热锅",
    description: "中火把炒锅烧热。",
    durationMinutes: 1,
    prev: [rinseBeef.id, soakPotato.id, cutCarrot.id, sliceGinger.id],
    equipment: [{ name: "炒锅", group: "加热" }],
  })

  const addOil = createNode({
    title: "倒入食用油",
    description: "把食用油倒入锅里。",
    durationMinutes: 1,
    ingredients: [{ name: "食用油", count: { value: 15, unit: "毫升" } }],
  })

  const addGinger = createNode({
    title: "下姜片",
    description: "把姜片下入锅中。",
    durationMinutes: 1,
    ingredients: [{ name: "姜片", count: { value: 4, unit: "片" } }],
  })

  const addStarAnise = createNode({
    title: "下八角",
    description: "把八角下入锅中。",
    durationMinutes: 1,
    ingredients: [{ name: "八角", count: { value: 2, unit: "个" } }],
  })

  const bloomSpices = createNode({
    title: "炒香香料",
    description: "把姜片和八角炒出香味。",
    durationMinutes: 1,
    equipment: [{ name: "锅铲", group: "加热" }],
  })

  const addBeef = createNode({
    title: "下入牛腩",
    description: "把焯好的牛腩倒入锅中。",
    durationMinutes: 1,
    ingredients: [{ name: "焯好的牛腩", count: { value: 500, unit: "克" } }],
  })

  const fryBeef = createNode({
    title: "翻炒牛腩",
    description: "把牛腩翻炒到表面微焦。",
    durationMinutes: 3,
    equipment: [{ name: "锅铲", group: "加热" }],
  })

  const addLightSoy = createNode({
    title: "加入生抽",
    description: "把生抽倒入锅中。",
    durationMinutes: 1,
    ingredients: [{ name: "生抽", count: { value: 25, unit: "毫升" } }],
  })

  const addDarkSoy = createNode({
    title: "加入老抽",
    description: "把老抽倒入锅中。",
    durationMinutes: 1,
    ingredients: [{ name: "老抽", count: { value: 10, unit: "毫升" } }],
  })

  const addHotWater = createNode({
    title: "加入热水",
    description: "加入热水没过牛腩。",
    durationMinutes: 1,
  })

  const boilStew = createNode({
    title: "煮开锅内汤汁",
    description: "把锅内汤汁重新煮开。",
    durationMinutes: 2,
  })

  const transferToPot = createNode({
    title: "转入炖锅",
    description: "把牛腩和汤汁转入炖锅。",
    durationMinutes: 1,
    equipment: [{ name: "炖锅", group: "加热" }],
  })

  const stewBeef = createNode({
    title: "慢炖牛腩",
    description: "中小火慢炖 50 分钟。",
    async: { waitMinutes: 50 },
    intermediateIngredients: [{ name: "半熟牛腩", count: { value: 500, unit: "克" } }],
  })

  const addPotato = createNode({
    title: "加入土豆块",
    description: "把土豆块加入炖锅。",
    durationMinutes: 1,
    ingredients: [{ name: "土豆块", count: { value: 2, unit: "个" } }],
  })

  const addCarrot = createNode({
    title: "加入胡萝卜块",
    description: "把胡萝卜块加入炖锅。",
    durationMinutes: 1,
    ingredients: [{ name: "胡萝卜块", count: { value: 1, unit: "根" } }],
  })

  const simmerVegetables = createNode({
    title: "继续炖煮",
    description: "继续小火炖 20 分钟。",
    async: { waitMinutes: 20 },
  })

  const reduceSauce = createNode({
    title: "大火收汁",
    description: "把汤汁收浓到略微挂勺。",
    durationMinutes: 3,
    tips: ["若土豆已软但汤汁仍多，可先捞出土豆再单独收汁。"],
  })

  const plateStew = createNode({
    title: "装盘",
    description: "把土豆烧牛腩装盘。",
    durationMinutes: 1,
  })

  connect(beefToPot, addBlanchWine)
  connect(addBlanchWine, addBlanchGinger)
  connect(addBlanchGinger, boilBeef)
  connect(boilBeef, skimFoam)
  connect(skimFoam, rinseBeef)
  connect(cutPotato, soakPotato)
  connect(heatWok, addOil)
  connect(addOil, addGinger)
  connect(addGinger, addStarAnise)
  connect(addStarAnise, bloomSpices)
  connect(bloomSpices, addBeef)
  connect(addBeef, fryBeef)
  connect(fryBeef, addLightSoy)
  connect(addLightSoy, addDarkSoy)
  connect(addDarkSoy, addHotWater)
  connect(addHotWater, boilStew)
  connect(boilStew, transferToPot)
  connect(transferToPot, stewBeef)
  connect(stewBeef, addPotato)
  connect(addPotato, addCarrot)
  connect(addCarrot, simmerVegetables)
  connect(simmerVegetables, reduceSauce)
  connect(reduceSauce, plateStew)

  return {
    meta: {
      id: "braised-beef-brisket-with-potato",
      name: "土豆烧牛腩",
      description: "按真实家常炖法拆细的牛腩菜谱，顺着步骤就能做。",
      ingredients: [
        { name: "牛腩", count: { value: 500, unit: "克" } },
        { name: "土豆", count: { value: 2, unit: "个" } },
        { name: "胡萝卜", count: { value: 1, unit: "根" }, optional: true },
        { name: "姜", count: { value: 6, unit: "片" } },
        { name: "八角", count: { value: 2, unit: "个" } },
        { name: "生抽", count: { value: 25, unit: "毫升" } },
        { name: "老抽", count: { value: 10, unit: "毫升" } },
        { name: "料酒", count: { value: 20, unit: "毫升" } },
        { name: "食用油", count: { value: 15, unit: "毫升" } },
      ],
      equipment: [
        { name: "炖锅", group: "加热" },
        { name: "炒锅", group: "加热" },
        { name: "锅铲", group: "加热" },
      ],
      tags: ["炖菜", "牛肉", "土豆", "家常菜"],
      coverImageUrl: "/images/recipes/braised-beef-brisket-with-potato.jpg",
      servings: 3,
      difficulty: RecipeDifficulty.Medium,
      author: "Cookingo Mock",
      source: "Mock Data",
      createdAt: CREATED_AT,
      updatedAt: CREATED_AT,
    },
    process: [beefToPot, cutPotato, cutCarrot, sliceGinger, heatWok],
  }
}

function createKungPaoChickenRecipe(): IRecipeSchema {
  const { createNode, connect } = createRecipeBuilder()

  const cutChicken = createNode({
    title: "切鸡丁",
    description: "把鸡胸肉切成均匀小丁。",
    durationMinutes: 2,
    ingredients: [{ name: "鸡胸肉", count: { value: 300, unit: "克" } }],
    intermediateIngredients: [{ name: "鸡丁", count: { value: 300, unit: "克" } }],
  })

  const addSoyForChicken = createNode({
    title: "加入生抽",
    description: "往鸡丁里加入一半生抽。",
    durationMinutes: 1,
    ingredients: [{ name: "生抽", count: { value: 10, unit: "毫升" } }],
  })

  const addStarchForChicken = createNode({
    title: "加入淀粉",
    description: "往鸡丁里加入一半淀粉。",
    durationMinutes: 1,
    ingredients: [{ name: "淀粉", count: { value: 5, unit: "克" } }],
  })

  const mixChicken = createNode({
    title: "抓匀鸡丁",
    description: "把鸡丁抓匀到表面起浆。",
    durationMinutes: 1,
    intermediateIngredients: [{ name: "上浆鸡丁", count: { value: 300, unit: "克" } }],
  })

  const marinateChicken = createNode({
    title: "静置鸡丁",
    description: "静置鸡丁 10 分钟。",
    async: { waitMinutes: 10 },
    intermediateIngredients: [{ name: "腌好的鸡丁", count: { value: 300, unit: "克" } }],
  })

  const cutCucumber = createNode({
    title: "切黄瓜丁",
    description: "把黄瓜切成小丁。",
    durationMinutes: 2,
    ingredients: [{ name: "黄瓜", count: { value: 1, unit: "根" } }],
    intermediateIngredients: [{ name: "黄瓜丁", count: { value: 1, unit: "份" } }],
  })

  const minceGinger = createNode({
    title: "切姜末",
    description: "把姜切成姜末。",
    durationMinutes: 1,
    ingredients: [{ name: "姜", count: { value: 3, unit: "片" } }],
    intermediateIngredients: [{ name: "姜末", count: { value: 1, unit: "份" } }],
  })

  const minceGarlic = createNode({
    title: "切蒜末",
    description: "把蒜切成蒜末。",
    durationMinutes: 1,
    ingredients: [{ name: "蒜", count: { value: 3, unit: "瓣" } }],
    intermediateIngredients: [{ name: "蒜末", count: { value: 1, unit: "份" } }],
  })

  const combineAromatics = createNode({
    title: "合并姜蒜末",
    description: "把姜末和蒜末放在一起。",
    durationMinutes: 1,
    intermediateIngredients: [{ name: "姜蒜末", count: { value: 1, unit: "份" } }],
  })

  const addSoyForSauce = createNode({
    title: "调汁加生抽",
    description: "往碗里加入剩余生抽。",
    durationMinutes: 1,
    ingredients: [{ name: "生抽", count: { value: 10, unit: "毫升" } }],
    equipment: [{ name: "碗", group: "处理" }],
  })

  const addVinegar = createNode({
    title: "调汁加香醋",
    description: "往碗里加入香醋。",
    durationMinutes: 1,
    ingredients: [{ name: "香醋", count: { value: 15, unit: "毫升" } }],
    equipment: [{ name: "碗", group: "处理" }],
  })

  const addSugar = createNode({
    title: "调汁加白糖",
    description: "往碗里加入白糖。",
    durationMinutes: 1,
    ingredients: [{ name: "白糖", count: { value: 12, unit: "克" } }],
    equipment: [{ name: "碗", group: "处理" }],
  })

  const addStarchForSauce = createNode({
    title: "调汁加淀粉",
    description: "往碗里加入剩余淀粉。",
    durationMinutes: 1,
    ingredients: [{ name: "淀粉", count: { value: 5, unit: "克" } }],
    equipment: [{ name: "碗", group: "处理" }],
  })

  const mixSauce = createNode({
    title: "搅匀宫保汁",
    description: "把碗里的调料搅成均匀碗汁。",
    durationMinutes: 1,
    equipment: [{ name: "碗", group: "处理" }],
    intermediateIngredients: [{ name: "宫保汁", count: { value: 1, unit: "碗" } }],
  })

  const heatWok = createNode({
    title: "中火热锅",
    description: "中火把炒锅烧热。",
    durationMinutes: 1,
    prev: [marinateChicken.id, cutCucumber.id, combineAromatics.id, mixSauce.id],
    equipment: [{ name: "炒锅", group: "加热" }],
  })

  const addPeanutOil = createNode({
    title: "倒少量油",
    description: "倒入少量食用油。",
    durationMinutes: 1,
    ingredients: [{ name: "食用油", count: { value: 5, unit: "毫升" } }],
  })

  const addPeanuts = createNode({
    title: "下花生米",
    description: "把花生米下入锅中。",
    durationMinutes: 1,
    ingredients: [{ name: "花生米", count: { value: 50, unit: "克" } }],
  })

  const toastPeanuts = createNode({
    title: "炒香花生米",
    description: "把花生米炒到微微上色。",
    durationMinutes: 2,
    equipment: [{ name: "锅铲", group: "加热" }],
    intermediateIngredients: [{ name: "熟花生米", count: { value: 50, unit: "克" } }],
  })

  const removePeanuts = createNode({
    title: "盛出花生米",
    description: "把花生米盛出备用。",
    durationMinutes: 1,
    ingredients: [{ name: "熟花生米", count: { value: 50, unit: "克" } }],
  })

  const addStirFryOil = createNode({
    title: "补入炒菜油",
    description: "锅里补入剩余食用油。",
    durationMinutes: 1,
    ingredients: [{ name: "食用油", count: { value: 15, unit: "毫升" } }],
  })

  const addChili = createNode({
    title: "下干辣椒",
    description: "把干辣椒下入锅中。",
    durationMinutes: 1,
    ingredients: [{ name: "干辣椒", count: { value: 8, unit: "个" } }],
  })

  const addPeppercorn = createNode({
    title: "下花椒",
    description: "把花椒下入锅中。",
    durationMinutes: 1,
    ingredients: [{ name: "花椒", count: { value: 5, unit: "克" } }],
  })

  const bloomSpices = createNode({
    title: "炒香辣椒花椒",
    description: "把辣椒和花椒炒出辛香味。",
    durationMinutes: 1,
    equipment: [{ name: "锅铲", group: "加热" }],
  })

  const addAromatics = createNode({
    title: "下姜蒜末",
    description: "把姜蒜末下入锅中。",
    durationMinutes: 1,
    ingredients: [{ name: "姜蒜末", count: { value: 1, unit: "份" } }],
  })

  const fryAromatics = createNode({
    title: "炒香姜蒜末",
    description: "把姜蒜末炒香。",
    durationMinutes: 1,
    equipment: [{ name: "锅铲", group: "加热" }],
  })

  const addChicken = createNode({
    title: "下鸡丁",
    description: "把鸡丁下入锅中。",
    durationMinutes: 1,
    ingredients: [{ name: "腌好的鸡丁", count: { value: 300, unit: "克" } }],
  })

  const stirFryChicken = createNode({
    title: "滑炒鸡丁",
    description: "把鸡丁滑炒到变色。",
    durationMinutes: 2,
    equipment: [{ name: "锅铲", group: "加热" }],
  })

  const addCucumber = createNode({
    title: "下黄瓜丁",
    description: "把黄瓜丁下入锅中。",
    durationMinutes: 1,
    ingredients: [{ name: "黄瓜丁", count: { value: 1, unit: "份" } }],
  })

  const addSauce = createNode({
    title: "倒入宫保汁",
    description: "把宫保汁倒入锅中。",
    durationMinutes: 1,
    ingredients: [{ name: "宫保汁", count: { value: 1, unit: "碗" } }],
  })

  const thickenSauce = createNode({
    title: "翻炒收汁",
    description: "把锅里汤汁炒到包住食材。",
    durationMinutes: 1,
    equipment: [{ name: "锅铲", group: "加热" }],
  })

  const returnPeanuts = createNode({
    title: "倒回花生米",
    description: "把花生米倒回锅中。",
    durationMinutes: 1,
    ingredients: [{ name: "熟花生米", count: { value: 50, unit: "克" } }],
  })

  const finishKungPao = createNode({
    title: "翻匀出锅",
    description: "快速翻匀后出锅。",
    durationMinutes: 1,
    tips: ["花生米最后回锅，能保持脆感。"],
  })

  connect(cutChicken, addSoyForChicken)
  connect(addSoyForChicken, addStarchForChicken)
  connect(addStarchForChicken, mixChicken)
  connect(mixChicken, marinateChicken)
  connect(minceGinger, minceGarlic)
  connect(minceGarlic, combineAromatics)
  connect(addSoyForSauce, addVinegar)
  connect(addVinegar, addSugar)
  connect(addSugar, addStarchForSauce)
  connect(addStarchForSauce, mixSauce)
  connect(heatWok, addPeanutOil)
  connect(addPeanutOil, addPeanuts)
  connect(addPeanuts, toastPeanuts)
  connect(toastPeanuts, removePeanuts)
  connect(removePeanuts, addStirFryOil)
  connect(addStirFryOil, addChili)
  connect(addChili, addPeppercorn)
  connect(addPeppercorn, bloomSpices)
  connect(bloomSpices, addAromatics)
  connect(addAromatics, fryAromatics)
  connect(fryAromatics, addChicken)
  connect(addChicken, stirFryChicken)
  connect(stirFryChicken, addCucumber)
  connect(addCucumber, addSauce)
  connect(addSauce, thickenSauce)
  connect(thickenSauce, returnPeanuts)
  connect(returnPeanuts, finishKungPao)

  return {
    meta: {
      id: "kung-pao-chicken",
      name: "宫保鸡丁",
      description: "按真实快炒节奏细化的宫保鸡丁，配料和下锅顺序都可直接执行。",
      ingredients: [
        { name: "鸡胸肉", count: { value: 300, unit: "克" } },
        { name: "花生米", count: { value: 50, unit: "克" } },
        { name: "黄瓜", count: { value: 1, unit: "根" }, optional: true },
        { name: "干辣椒", count: { value: 8, unit: "个" } },
        { name: "花椒", count: { value: 5, unit: "克" } },
        { name: "姜", count: { value: 3, unit: "片" } },
        { name: "蒜", count: { value: 3, unit: "瓣" } },
        { name: "生抽", count: { value: 20, unit: "毫升" } },
        { name: "香醋", count: { value: 15, unit: "毫升" } },
        { name: "白糖", count: { value: 12, unit: "克" } },
        { name: "淀粉", count: { value: 10, unit: "克" } },
        { name: "食用油", count: { value: 20, unit: "毫升" } },
      ],
      equipment: [
        { name: "炒锅", group: "加热" },
        { name: "锅铲", group: "加热" },
        { name: "碗", group: "处理" },
      ],
      tags: ["川菜", "快炒", "鸡肉", "下饭"],
      coverImageUrl: "/images/recipes/kung-pao-chicken.jpg",
      servings: 2,
      difficulty: RecipeDifficulty.Medium,
      author: "Cookingo Mock",
      source: "Mock Data",
      createdAt: CREATED_AT,
      updatedAt: CREATED_AT,
    },
    process: [cutChicken, cutCucumber, minceGinger, addSoyForSauce, heatWok],
  }
}

export const mockRecipes: IRecipeSchema[] = [
  createTomatoEggRecipe(),
  createColaWingsRecipe(),
  createGarlicBroccoliRecipe(),
  createBeefStewRecipe(),
  createKungPaoChickenRecipe(),
]

for (const recipe of mockRecipes) {
  validateRecipeSchema(recipe)
}

export default mockRecipes
