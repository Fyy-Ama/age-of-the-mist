// 迷雾纪元 - 任务与对话数据

// 对话树结构：
// {
//   id, name,
//   start: string | [{ nodeId, condition }],   // 支持按状态选择开场节点
//   nodes: {
//     nodeId: {
//       speaker?, text, effects?: [effect],
//       next?: nodeId,                          // 无选项时的下一节点
//       choices?: [{ text, next, condition?, effects? }]
//     }
//   }
// }
// 效果 effect: { type: 'startQuest'|'completeQuest'|'addItem'|'recordDiscovery'|'setFlag', ... }

const DIALOGUE_TREES = {

    // ===== 旅人营地 · 老旅人 =====
    npc_old_traveler: {
        id: 'npc_old_traveler',
        name: '老旅人',
        start: [
            { nodeId: 'complete', condition: { type: 'questState', questId: 'q_camp_first', state: 'completed' } },
            { nodeId: 'progress', condition: { type: 'questState', questId: 'q_camp_first', state: 'active' } },
            { nodeId: 'greeting' }
        ],
        nodes: {
            greeting: {
                text: '篝火噼啪作响，老人抬起被风霜刻满沟壑的脸。"又一个被迷雾吐出来的旅人啊。"他递来一碗热汤，"坐下吧，孩子。这片大陆曾经有过名字，如今连风都记不清了。"',
                choices: [
                    { text: '这里发生了什么？', next: 'lore' },
                    { text: '我能做些什么吗？', next: 'quest_offer' },
                    { text: '告辞', next: null }
                ]
            },
            lore: {
                text: '"五百年前，迷雾从地底涌出，吞没了所有的道路与城邦。"老人的目光穿过火焰，落在远处的黑暗里，"幸存者散落成如今的五个聚落。我们守着这点火光，等着有人能重新走通那些被遗忘的路。"',
                choices: [
                    { text: '那个人会是我吗？', next: 'quest_offer' },
                    { text: '听起来毫无希望。', next: 'doubt' },
                    { text: '告辞', next: null }
                ]
            },
            doubt: {
                text: '老人低低地笑了，笑声像枯叶摩擦。"希望从来不是靠听起来成立的。"他站起身，指向营地外的迷雾，"它靠一双愿意迈出去的脚。去吧，先从最近的森林开始——那里的隐士药师，或许需要一位新朋友。"',
                effects: [{ type: 'setFlag', flag: 'traveler_encouraged' }],
                choices: [
                    { text: '我会去看看的。', next: 'quest_offer' },
                    { text: '告辞', next: null }
                ]
            },
            quest_offer: {
                text: '"既然你愿意帮忙——"老人从怀里取出一枚温热的旧铜币，"带上它。营地东边的迷雾森林里长着月瓣草，替我采三株回来。药师会用它们救人，而你……也该学会辨认这片土地给予的馈赠。"',
                choices: [
                    { text: '我接受这个委托。', next: 'accept', effects: [{ type: 'startQuest', questId: 'q_camp_first' }] },
                    { text: '我还没准备好。', next: 'decline' }
                ]
            },
            accept: {
                text: '"好孩子。"老人把铜币塞进你掌心，金属还带着体温，"记住，月瓣草只在银光下绽放。别在正午的烈日下白费力气。去吧，迷雾会为你让路——只要你不怕它。"',
                choices: [
                    { text: '我这就出发。', next: null }
                ]
            },
            decline: {
                text: '老人点点头，并不意外。"准备好的时候，篝火永远为你留着位置。"他重新坐下，望向火焰，仿佛那里藏着一整片已经消失的星空。',
                choices: [
                    { text: '告辞', next: null }
                ]
            },
            progress: {
                text: '"月瓣草采得如何了？"老人拨了拨篝火，火星腾起，"记住，它们只在银光下绽放。若还没找到，不妨等到夜里再去森林深处看看。"',
                choices: [
                    { text: '我会继续的。', next: null }
                ]
            },
            complete: {
                text: '老人看着你，眼角的皱纹舒展开来。"你身上有了旅人的味道——泥土、露水，还有一点点迷雾。"他往火里添了根柴，"往北的神殿、西边的洞窟、南面的海岸……路还长。但今晚，先在这堆火旁歇歇吧。"',
                choices: [
                    { text: '谢谢你，老人家。', next: null }
                ]
            }
        }
    },

    // ===== 迷雾森林 · 隐士药师 =====
    npc_hermit_herbalist: {
        id: 'npc_hermit_herbalist',
        name: '隐士药师',
        start: [
            { nodeId: 'epilogue', condition: { type: 'questState', questId: 'q_forest_herb', state: 'completed' } },
            { nodeId: 'complete', condition: { type: 'questState', questId: 'q_forest_herb', state: 'ready' } },
            { nodeId: 'deliver', condition: { type: 'questState', questId: 'q_forest_herb', state: 'active' } },
            { nodeId: 'greeting' }
        ],
        nodes: {
            greeting: {
                text: '草药的苦香从树洞小屋里涌出。一个披着苔绿色斗篷的身影头也不抬，正把捣碎的叶子敷在一块布上。"生人。"她的声音沙哑却平静，"迷雾森林不常迎来还能站着说话的人。你要么是幸运，要么是鲁莽。"',
                choices: [
                    { text: '你是谁？', next: 'identity' },
                    { text: '你需要帮助吗？', next: 'quest_offer' },
                    { text: '森林深处还有什么麻烦吗？', next: 'side_offer_forest', condition: { type: 'canStartQuest', questId: 'q_forest_guardian' } },
                    { text: '告辞', next: null }
                ]
            },
            identity: {
                text: '"药师。名字早被雾气吃掉了。"她终于抬眼，瞳孔是罕见的琥珀色，"我为这片森林里所有还会呼吸的东西疗伤——包括偶尔闯进来的、像你这样的傻子。"',
                choices: [
                    { text: '我能帮上忙吗？', next: 'quest_offer' },
                    { text: '告辞', next: null }
                ]
            },
            quest_offer: {
                text: '她指了指屋外浓得化不开的夜色。"林深处的月瓣草快断收了。它只在月光下开花，采下来能镇住最凶的高热。"她把一只空布袋丢给你，"替我采三株完整的月瓣草回来。作为交换，我教你辨认森林里哪些东西能碰、哪些碰了就死。"',
                choices: [
                    { text: '交给我吧。', next: 'accept', effects: [{ type: 'startQuest', questId: 'q_forest_herb' }] },
                    { text: '我先去别处看看。', next: 'decline' }
                ]
            },
            accept: {
                text: '"聪明。"药师重新低下头，"记住——只在夜里采，只采花瓣完全张开的。半开的没药性，全谢的有毒。森林会考验你的耐心，别急着交差。"',
                choices: [
                    { text: '明白了。', next: null }
                ]
            },
            decline: {
                text: '她哼了一声，不算不满。"迷雾森林留不住不想留的人。"捣药的声音又响起来，"想清楚了再来，布袋我给你留着。"',
                choices: [
                    { text: '告辞', next: null }
                ]
            },
            deliver: {
                text: '药师瞥了一眼你的布袋。"月瓣草采够了吗？三株，夜里开的，花瓣完整的。"她摆摆手，"没采够就别来烦我，药性这东西糊弄不了。"',
                choices: [
                    { text: '我这就去采。', next: null }
                ]
            },
            complete: {
                text: '药师接过月瓣草，就着火光细细端详，琥珀色的眼睛里闪过一丝赞许。"完整、新鲜、带着夜露。"她从架子上取下一小瓶墨绿色的药膏，"拿着。影叶划的伤口、守卫者的爪痕，抹上就好。森林认你了，旅人。"',
                effects: [{ type: 'completeQuest', questId: 'q_forest_herb' }],
                choices: [
                    { text: '多谢。', next: null }
                ]
            },
            epilogue: {
                text: '药师正在晾晒新采的草药，见你过来，琥珀色的眼睛里闪过一丝笑意。"药膏还够用吗？"她不等回答，又低头忙活起来，"森林认你了，旅人。别死在外面就行。"',
                choices: [
                    { text: '森林深处还有麻烦吗？', next: 'side_offer_forest', condition: { type: 'canStartQuest', questId: 'q_forest_guardian' } },
                    { text: '我会小心的。', next: null }
                ]
            },
            side_offer_forest: {
                text: '药师停下手中的药杵，望向森林深处那片化不开的浓雾。"有件事我一直放心不下。"她压低声音，"林子深处有个东西——一团雾凝成的人形，我们叫它林地守卫者。它不分青红皂白地拦住所有过路的人，把好几个采药的都吓跑了。"她摇摇头，"它本不是这样的。是迷雾钻进了它心里，把它困在了原地。你若能进去，替我把它从这场噩梦里解脱出来，森林会感激你的。"',
                choices: [
                    { text: '我去会会它。', next: 'side_accept_forest', effects: [{ type: 'startQuest', questId: 'q_forest_guardian' }] },
                    { text: '那东西太危险了。', next: null }
                ]
            },
            side_accept_forest: {
                text: '"小心。"药师把一小束晒干的草药塞给你，"它被迷雾蒙了眼，会把你当成敌人。别犹豫——犹豫的人永远走不出那片林子。"',
                choices: [
                    { text: '我记住了。', next: null }
                ]
            }
        }
    },

    // ===== 废弃神殿 · 石碑守卫 =====
    npc_stele_warden: {
        id: 'npc_stele_warden',
        name: '石碑守卫',
        start: [
            { nodeId: 'epilogue', condition: { type: 'questState', questId: 'q_temple_guardian', state: 'completed' } },
            { nodeId: 'complete', condition: { type: 'questState', questId: 'q_temple_guardian', state: 'ready' } },
            { nodeId: 'progress', condition: { type: 'questState', questId: 'q_temple_guardian', state: 'active' } },
            { nodeId: 'greeting' }
        ],
        nodes: {
            greeting: {
                text: '断壁残垣间，一尊半人半石的守卫缓缓转动头颅，关节处簌簌落灰。"血肉之躯。"它的声音像石头碾过石头，"神殿守望者已被迷雾侵蚀，如今它只认得破坏。我……已无力阻止它。"',
                choices: [
                    { text: '神殿守望者是什么？', next: 'lore' },
                    { text: '我能帮忙。', next: 'quest_offer' },
                    { text: '神殿里还有别的遗物散落吗？', next: 'side_offer_temple', condition: { type: 'canStartQuest', questId: 'q_temple_relic' } },
                    { text: '告辞', next: null }
                ]
            },
            lore: {
                text: '"它曾与我一同守卫这些碑文——那是旧世界最后的记忆。"守卫伸出一只石手，抚过身旁刻满符文的残碑，"迷雾钻进它心里，把它变成了憎恨的容器。若放任下去，连这些石头上的字都会被它砸碎。"',
                choices: [
                    { text: '我会阻止它。', next: 'quest_offer' },
                    { text: '这太危险了。', next: 'fear' },
                    { text: '告辞', next: null }
                ]
            },
            fear: {
                text: '"危险？"守卫的石脸上浮现出近乎悲哀的神情，"记忆消亡才是真正的危险。若碑文尽毁，再没有人记得这个世界曾经的样子。你我都将成为迷雾的一部分。"',
                choices: [
                    { text: '你说得对，我来做。', next: 'quest_offer' },
                    { text: '告辞', next: null }
                ]
            },
            quest_offer: {
                text: '"神殿中庭，守望者就盘踞在那里。"守卫的胸口裂开一道微光，"击败它，让它的灵魂从迷雾中解脱。作为回报，我会为你解读碑文上记载的、通往其他聚落的古老道路。"',
                choices: [
                    { text: '我接受挑战。', next: 'accept', effects: [{ type: 'startQuest', questId: 'q_temple_guardian' }] },
                    { text: '我需要先做准备。', next: 'decline' }
                ]
            },
            accept: {
                text: '"勇敢。"守卫缓缓单膝跪地，扬起一片尘土，"守望者一击致命，别与它硬拼——绕到它背后，用你手中的武器了结它。愿碑文的先灵护佑你。"',
                choices: [
                    { text: '我这就去。', next: null }
                ]
            },
            decline: {
                text: '守卫点点头，石质的动作迟缓而庄重。"准备是明智的。碑文会等你，我也一样——只要这些石头还没被迷雾彻底吞没。"',
                choices: [
                    { text: '告辞', next: null }
                ]
            },
            progress: {
                text: '"守望者仍在中庭游荡。"守卫望向神殿深处，那里传来低沉的咆哮，"我感受到它的痛苦，也感受到它的愤怒。去终结这一切吧，旅人。"',
                choices: [
                    { text: '我这就去。', next: null }
                ]
            },
            complete: {
                text: '守卫胸口的微光骤然明亮，仿佛卸下千斤重担。"它解脱了……我也终于能安心。"它伸出石手，指向残碑上忽然浮现的一行符文，"看，这是通往幽暗洞窟的古道。你已证明自己配得上这些记忆。"',
                effects: [{ type: 'completeQuest', questId: 'q_temple_guardian' }],
                choices: [
                    { text: '我会记住这条路。', next: null }
                ]
            },
            epilogue: {
                text: '石碑守卫静立在残碑旁，胸口的微光平稳而安宁。"记忆已重新流动。"它缓缓颔首，石质的动作庄重如仪，"去吧，旅人。古道会指引你——正如你守护了这些文字。"',
                choices: [
                    { text: '神殿里还有别的遗物散落吗？', next: 'side_offer_temple', condition: { type: 'canStartQuest', questId: 'q_temple_relic' } },
                    { text: '我会记住这条路。', next: null }
                ]
            },
            side_offer_temple: {
                text: '石碑守卫的目光扫过满地碎石，胸口的微光黯淡了几分。"神殿倾覆时，许多圣物散落各处。"它缓缓抬起石手，指向残垣深处，"有两件对我尤为重要——一枚刻着古老符文的符文石，还有一副先灵佩戴的骨面具。它们被尘埃掩埋，被迷雾侵蚀。若你能将它们寻回，即便只是重新触摸它们，神殿的记忆也能完整一分。"',
                choices: [
                    { text: '我去找。', next: 'side_accept_temple', effects: [{ type: 'startQuest', questId: 'q_temple_relic' }] },
                    { text: '我先忙别的。', next: null }
                ]
            },
            side_accept_temple: {
                text: '"愿碑文的先灵指引你。"守卫颔首，石屑簌簌落下，"符文石在中庭的断壁上，骨面具则在倒塌的神像手中。它们仍残留着旧世界的气息——你会认出来的。"',
                choices: [
                    { text: '我这就去。', next: null }
                ]
            }
        }
    },

    // ===== 幽暗洞窟 · 迷途矿工 =====
    npc_lost_miner: {
        id: 'npc_lost_miner',
        name: '迷途矿工',
        start: [
            { nodeId: 'epilogue', condition: { type: 'questState', questId: 'q_cave_explore', state: 'completed' } },
            { nodeId: 'complete', condition: { type: 'questState', questId: 'q_cave_explore', state: 'ready' } },
            { nodeId: 'progress', condition: { type: 'questState', questId: 'q_cave_explore', state: 'active' } },
            { nodeId: 'greeting' }
        ],
        nodes: {
            greeting: {
                text: '一盏摇曳的油灯下，满脸煤灰的矿工蜷坐在岩壁边，怀里抱着一把卷了刃的镐。"嘘——别出声。"他神经质地四下张望，"洞窟深处有东西……它把我同伴带走了。三天了，就剩我一个。"',
                choices: [
                    { text: '你的同伴怎么了？', next: 'lore' },
                    { text: '我帮你找。', next: 'quest_offer' },
                    { text: '告辞', next: null }
                ]
            },
            lore: {
                text: '"我们来挖发光的矿石——洞窟巨影的巢穴边上，那种石头最亮，也最值钱。"矿工的手抖得厉害，"然后巨影醒了。阿岩跑得慢……我听见他的喊声越来越远。"他把脸埋进膝盖，"我不敢回去。我是个懦夫。"',
                choices: [
                    { text: '我去救他。', next: 'quest_offer' },
                    { text: '也许他已经……', next: 'grim' },
                    { text: '告辞', next: null }
                ]
            },
            grim: {
                text: '"别说了！"矿工猛地抬头，眼里布满血丝，随即又垮下肩膀，"……我知道。可只要没见到人，我就当他还活着。求你，去洞窟深处看看。哪怕……哪怕只带回他的镐。"',
                choices: [
                    { text: '我会去看个明白。', next: 'quest_offer' },
                    { text: '告辞', next: null }
                ]
            },
            quest_offer: {
                text: '矿工把油灯往你手里塞，灯油晃出一圈暖光。"洞窟最深处，巨影盘踞的地方——阿岩就是在那儿失踪的。"他咽了口唾沫，"探到那里，找到他的下落。我……我把这盏灯给你，它比我的胆子管用。"',
                choices: [
                    { text: '等我回来。', next: 'accept', effects: [{ type: 'startQuest', questId: 'q_cave_explore' }] },
                    { text: '这洞窟太深了。', next: 'decline' }
                ]
            },
            accept: {
                text: '"谢……谢谢你。"矿工的声音哽咽了，"记住，越深越黑，别灭了灯。巨影怕光——它常年待在黑暗里，眼睛受不住亮。"',
                choices: [
                    { text: '我记住了。', next: null }
                ]
            },
            decline: {
                text: '矿工没有生气，只是把油灯抱得更紧了些。"我明白。"他望向洞窟深处的黑暗，"我也怕。可总得有人去……等你准备好了，我还在老地方。"',
                choices: [
                    { text: '告辞', next: null }
                ]
            },
            progress: {
                text: '"找到阿岩了吗？"矿工站起来，又无力地坐下，"洞窟最深处，巨影的巢穴。小心点……那东西比传闻里更凶。"',
                choices: [
                    { text: '我这就去。', next: null }
                ]
            },
            complete: {
                text: '听完你的叙述，矿工沉默良久，眼泪在煤灰上冲出两道白痕。"至少……他不用再一个人待在黑里了。"他从怀里掏出一块温润的发光矿石，"这是阿岩最后挖到的。给你——它该跟着一个勇敢的人，而不是我这样的懦夫。"',
                effects: [{ type: 'completeQuest', questId: 'q_cave_explore' }],
                choices: [
                    { text: '他不是白走的。', next: null }
                ]
            },
            epilogue: {
                text: '矿工把油灯举得高了些，煤灰下的神情比初见时平静了许多。"你又回来了……真好。"他望向洞窟深处，声音不再发抖，"阿岩的事，谢谢你。我……我打算再挖一会儿。这次，不怕了。"',
                choices: [
                    { text: '保重，矿工。', next: null }
                ]
            }
        }
    },

    // ===== 银色海岸 · 渔夫 =====
    npc_fisherman: {
        id: 'npc_fisherman',
        name: '渔夫',
        start: [
            { nodeId: 'epilogue', condition: { type: 'questState', questId: 'q_coast_relic', state: 'completed' } },
            { nodeId: 'complete', condition: { type: 'questState', questId: 'q_coast_relic', state: 'ready' } },
            { nodeId: 'deliver', condition: { type: 'questState', questId: 'q_coast_relic', state: 'active' } },
            { nodeId: 'greeting' }
        ],
        nodes: {
            greeting: {
                text: '银色的浪一层层漫上沙滩。一个皮肤黝黑的渔夫正修补渔网，海风把他花白的胡子吹得乱翘。"陆地上来的？"他咧嘴一笑，露出缺了颗的门牙，"这片海啊，捞上来的不止是鱼。有时候是宝贝，有时候……是不该捞的东西。"',
                choices: [
                    { text: '你捞到过什么？', next: 'lore' },
                    { text: '有活干吗？', next: 'quest_offer' },
                    { text: '海里还有别的宝贝吗？', next: 'side_offer_coast', condition: { type: 'canStartQuest', questId: 'q_coast_treasure' } },
                    { text: '告辞', next: null }
                ]
            },
            lore: {
                text: '"上个月，我网里捞上来两块冰晶——海里怎么会结冰？邪门得很。"渔夫压低声音，"老一辈说，那是沉没王国的眼泪。谁集齐了，就能听见海底的钟声。"他哈哈大笑，"当然，也可能是我这老糊涂编来哄小孩的。"',
                choices: [
                    { text: '我想去找找看。', next: 'quest_offer' },
                    { text: '告辞', next: null }
                ]
            },
            quest_offer: {
                text: '"想找乐子的话——"渔夫指了指退潮后湿漉漉的礁石，"沿着海岸线走走，替我捡两块冰晶回来。它们冲上岸时还冒着寒气，好认得很。"他眨眨眼，"找齐了，我就把压箱底的那件宝贝给你瞧瞧。"',
                choices: [
                    { text: '一言为定。', next: 'accept', effects: [{ type: 'startQuest', questId: 'q_coast_relic' }] },
                    { text: '我先四处转转。', next: 'decline' }
                ]
            },
            accept: {
                text: '"爽快！"渔夫用力拍了拍你的肩，"记住，冰晶只在退潮后的礁石缝里。别贪心往深海走——那儿的浪，可比它看着凶。"',
                choices: [
                    { text: '我这就去。', next: null }
                ]
            },
            decline: {
                text: '渔夫无所谓地耸耸肩，继续织他的网。"海又不会跑。"海风送来咸湿的气息，"想好了再来找我，老头子我就守在这片沙滩上。"',
                choices: [
                    { text: '告辞', next: null }
                ]
            },
            deliver: {
                text: '"冰晶找得咋样啦？"渔夫眯眼望着海面，"两块，冒着寒气的。退潮后的礁石缝里最好找。找齐了喊我一声。"',
                choices: [
                    { text: '我继续找。', next: null }
                ]
            },
            complete: {
                text: '渔夫接过两块冰晶，对着阳光端详，寒气在他掌心凝成白雾。"哈，真是沉没王国的眼泪。"他从船舱底摸出一枚锈迹斑斑的碎罗盘，郑重地放进你手里，"压箱底的宝贝——它永远指着北，哪怕北边什么都没有。拿着，比我的破网有用。"',
                effects: [{ type: 'completeQuest', questId: 'q_coast_relic' }],
                choices: [
                    { text: '这太珍贵了。', next: null }
                ]
            },
            epilogue: {
                text: '渔夫正把渔网挂上桅杆，海风把他花白的胡子吹得乱翘。"罗盘还好用不？"他咧嘴一笑，露出缺了颗的门牙，"它指着北，可路得你自己走。得空常回来看看老头子我。"',
                choices: [
                    { text: '海里还有别的宝贝吗？', next: 'side_offer_coast', condition: { type: 'canStartQuest', questId: 'q_coast_treasure' } },
                    { text: '一定，老伯。', next: null }
                ]
            },
            side_offer_coast: {
                text: '渔夫朝海面上啐了一口，压低嗓门神神秘秘地凑过来。"上回跟你说冰晶，你还不信。"他咧嘴一笑，"这回是真的——前阵子退大潮，露出半截沉船。船上散着两件好东西：一块绿得发亮的翡翠，还有一枚金币，成色好得很。"他拍拍你的肩，"我这把老骨头下不了深水了。你替我把它们捞上来，我讲个沉船的故事给你听，保准值回票价。"',
                choices: [
                    { text: '成交。', next: 'side_accept_coast', effects: [{ type: 'startQuest', questId: 'q_coast_treasure' }] },
                    { text: '我先转转。', next: null }
                ]
            },
            side_accept_coast: {
                text: '"痛快！"渔夫哈哈大笑，缺了颗的门牙格外显眼，"翡翠在潮汐池里，金币冲到了沙滩上。退潮后去最好找——记住，别贪心往深海走，那儿的浪比看着凶。"',
                choices: [
                    { text: '我这就去。', next: null }
                ]
            }
        }
    }
};

// ===== 任务定义 =====
// objective.type: 'collect'（itemId + count）| 'defeat'（guardianId）
// autoComplete: true 时目标达成即完成（无需返回 NPC 交付）；否则进入 ready 等待交付
// combat: true 表示战斗任务，适用软失败（倒下不改变任务状态，可重试，无惩罚）
// rewards 由任务引擎在完成时统一发放（物品 + 叙事发现），对话交付节点只触发 completeQuest

const QUEST_DEFS = {

    q_camp_first: {
        id: 'q_camp_first',
        name: '旅人的嘱托',
        type: 'main',
        regionId: 'travelers_camp',
        giverNpc: 'npc_old_traveler',
        summary: '老旅人请你采三株月瓣草，学会辨认这片土地给予的馈赠。',
        objectives: [
            { type: 'collect', itemId: 'herb_moonpetal', count: 3, text: '采集月瓣草' }
        ],
        objectiveHint: '月瓣草只在银光下绽放，营地、森林与海岸皆有生长。',
        autoComplete: true,
        combat: false,
        prerequisites: [],
        rewards: { items: [], discoveries: [] }
    },

    q_forest_herb: {
        id: 'q_forest_herb',
        name: '药师的药材',
        type: 'main',
        regionId: 'misty_forest',
        giverNpc: 'npc_hermit_herbalist',
        summary: '隐士药师需要三株完整的月瓣草，用来镇住最凶的高热。',
        objectives: [
            { type: 'collect', itemId: 'herb_moonpetal', count: 3, text: '采集月瓣草' }
        ],
        objectiveHint: '夜里采，只采花瓣完全张开的。森林深处与海岸银光下都有。',
        autoComplete: false,
        combat: false,
        prerequisites: [],
        rewards: {
            items: [{ id: 'herb_shadowleaf', count: 1 }],
            discoveries: []
        }
    },

    q_temple_guardian: {
        id: 'q_temple_guardian',
        name: '石碑的守望',
        type: 'main',
        regionId: 'abandoned_temple',
        giverNpc: 'npc_stele_warden',
        summary: '击败被迷雾侵蚀的神殿守望者，让它的灵魂从迷雾中解脱。',
        objectives: [
            { type: 'defeat', guardianId: 'guardian_temple', count: 1, text: '击败神殿守望者' }
        ],
        objectiveHint: '守望者盘踞在神殿中庭，一击致命——绕到背后了结它。',
        autoComplete: false,
        combat: true,
        prerequisites: [],
        rewards: {
            items: [],
            discoveries: [{ id: 'temple_ancient_path', text: '石碑守卫为你解读了通往幽暗洞窟的古老道路。' }]
        }
    },

    q_cave_explore: {
        id: 'q_cave_explore',
        name: '洞窟深处的下落',
        type: 'main',
        regionId: 'dark_cavern',
        giverNpc: 'npc_lost_miner',
        summary: '深入幽暗洞窟巨影的巢穴，探明矿工同伴阿岩的下落。',
        objectives: [
            { type: 'defeat', guardianId: 'guardian_cavern', count: 1, text: '击败洞窟巨影' }
        ],
        objectiveHint: '巨影怕光，别灭了灯。它盘踞在洞窟最深处。',
        autoComplete: false,
        combat: true,
        prerequisites: [],
        rewards: {
            items: [{ id: 'crystal_shard', count: 1 }],
            discoveries: []
        }
    },

    q_coast_relic: {
        id: 'q_coast_relic',
        name: '沉没王国的眼泪',
        type: 'main',
        regionId: 'silver_coast',
        giverNpc: 'npc_fisherman',
        summary: '沿海岸线寻找两块冰晶，换取渔夫压箱底的宝贝。',
        objectives: [
            { type: 'collect', itemId: 'crystal_ice', count: 2, text: '收集冰晶' }
        ],
        objectiveHint: '冰晶只在退潮后的礁石缝里，冒着寒气，好认得很。',
        autoComplete: false,
        combat: false,
        prerequisites: [],
        rewards: {
            items: [{ id: 'compass_broken', count: 1 }],
            discoveries: []
        }
    },

    // ===== 支线任务 =====

    q_forest_guardian: {
        id: 'q_forest_guardian',
        name: '林地的阴霾',
        type: 'side',
        regionId: 'misty_forest',
        giverNpc: 'npc_hermit_herbalist',
        summary: '迷雾森林深处的林地守卫者被迷雾困住，拦住了所有过路人。替药师将它从噩梦中解脱。',
        objectives: [
            { type: 'defeat', guardianId: 'guardian_forest', count: 1, text: '击败林地守卫者' }
        ],
        objectiveHint: '林地守卫者在森林深处游荡。它被迷雾蒙了眼，会把你当成敌人——别犹豫。',
        autoComplete: true,
        combat: true,
        prerequisites: [],
        rewards: {
            items: [{ id: 'herb_bloodthorn', count: 1 }],
            discoveries: [{ id: 'forest_guardian_freed', text: '林地守卫者在你手下消散，化作一缕清雾融入林间。森林深处的道路重新对过路人敞开。' }]
        }
    },

    q_temple_relic: {
        id: 'q_temple_relic',
        name: '散落的圣物',
        type: 'side',
        regionId: 'abandoned_temple',
        giverNpc: 'npc_stele_warden',
        summary: '神殿倾覆时散落了符文石与骨面具两件圣物。将它们寻回，让神殿的记忆完整一分。',
        objectives: [
            { type: 'collect', itemId: 'stone_rune', count: 1, text: '寻回符文石' },
            { type: 'collect', itemId: 'mask_bone', count: 1, text: '寻回骨面具' }
        ],
        objectiveHint: '符文石在中庭的断壁上，骨面具在倒塌的神像手中。它们仍残留着旧世界的气息。',
        autoComplete: true,
        combat: false,
        prerequisites: [],
        rewards: {
            items: [{ id: 'coin_silver', count: 1 }],
            discoveries: [{ id: 'temple_relics_found', text: '你在废墟中寻回了符文石与骨面具。当两件圣物重聚，残碑忽然泛起柔和的光——神殿的记忆被悄悄补全了一角。' }]
        }
    },

    q_coast_treasure: {
        id: 'q_coast_treasure',
        name: '沉船的馈赠',
        type: 'side',
        regionId: 'silver_coast',
        giverNpc: 'npc_fisherman',
        summary: '退大潮露出了半截沉船。替渔夫捞回散落的翡翠与金币，换他一个沉船的故事。',
        objectives: [
            { type: 'collect', itemId: 'gem_emerald', count: 1, text: '捞回翡翠' },
            { type: 'collect', itemId: 'coin_gold', count: 1, text: '捞回金币' }
        ],
        objectiveHint: '翡翠在潮汐池里，金币冲到了沙滩上。退潮后去最好找——别贪心往深海走。',
        autoComplete: true,
        combat: false,
        prerequisites: [],
        rewards: {
            items: [{ id: 'herb_starbloom', count: 1 }],
            discoveries: [{ id: 'sunken_ship_tale', text: '翡翠与金币重见天日。渔夫兑现承诺，讲起了那艘沉船与旧王国海上贸易的往事——原来这片银色的海岸，也曾千帆竞发。' }]
        }
    }
};
