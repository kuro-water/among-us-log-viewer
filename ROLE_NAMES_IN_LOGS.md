# ログに記録される役職名一覧

このドキュメントでは、`game_history.jsonl`に記録される役職名（`main_role`および`sub_roles`フィールド）の一覧を提供します。

## 記録フォーマット

役職情報は以下のように記録されます：

```json
"role": {
    "main_role": "Sheriff",
    "sub_roles": ["Lovers", "Guesser"]
}
```

- `main_role`: プレイヤーのメイン役職（必ず1つ）
- `sub_roles`: サブ役職の配列（0個以上）

---

## メイン役職（main_role）

### クルーメイト（Crewmate）陣営

#### バニラ役職
- `Crewmate` - クルーメイト（基本役職）
- `Engineer` - エンジニア
- `Scientist` - サイエンティスト
- `Tracker` - トラッカー
- `Noisemaker` - ノイズメーカー
- `Detective` - デテクティブ

#### カスタム役職
- `Bait` - ベイト
- `Lighter` - ライター
- `Mayor` - メイヤー
- `SabotageMaster` - サボタージュマスター
- `Sheriff` - シェリフ
- `Snitch` - スニッチ
- `SpeedBooster` - スピードブースター
- `Trapper` - トラッパー
- `Dictator` - ディクテーター
- `Doctor` - ドクター
- `Seer` - シーア
- `TimeManager` - タイムマネージャー
- `Gasp` - ガスプ
- `VentMaster` - ベントマスター
- `ToiletFan` - トイレファン
- `Bakery` - ベーカリー
- `FortuneTeller` - フォーチュンテラー
- `TaskStar` - タスクスター
- `PonkotuTeller` - ポンコツテラー
- `UltraStar` - ウルトラスター
- `MeetingSheriff` - ミーティングシェリフ
- `GuardMaster` - ガードマスター
- `Shyboy` - シャイボーイ
- `Balancer` - バランサー
- `ShrineMaiden` - 巫女
- `Comebacker` - カムバッカー
- `WhiteHacker` - ホワイトハッカー
- `WolfBoy` - ウルフボーイ
- `NiceAddoer` - ナイスアドゥアー
- `InSender` - インセンダー
- `Staff` - スタッフ
- `Efficient` - エフィシエント
- `Psychic` - サイキック
- `SwitchSheriff` - スイッチシェリフ
- `NiceLogger` - ナイスロガー
- `Android` - アンドロイド
- `King` - キング
- `AmateurTeller` - アマチュアテラー
- `Cakeshop` - ケーキショップ
- `Snowman` - スノーマン
- `Stolener` - ストレナー
- `VentOpener` - ベントオープナー
- `VentHunter` - ベントハンター
- `Walker` - ウォーカー
- `CandleLighter` - キャンドルライター
- `Express` - エクスプレス
- `Inspector` - インスペクター
- `AllArounder` - オールアラウンダー
- `Observer` - オブザーバー
- `Satellite` - サテライト
- `Merlin` - マーリン

### インポスター（Impostor）陣営

#### バニラ役職
- `Impostor` - インポスター（基本役職）
- `Shapeshifter` - シェイプシフター
- `Phantom` - ファントム
- `Viper` - バイパー

#### カスタム役職
- `BountyHunter` - バウンティハンター
- `FireWorks` - ファイアワークス
- `Mafia` - マフィア
- `SerialKiller` - シリアルキラー
- `ShapeMaster` - シェイプマスター
- `Sniper` - スナイパー
- `Vampire` - ヴァンパイア
- `Witch` - ウィッチ
- `Warlock` - ウォーロック
- `Mare` - メア
- `Penguin` - ペンギン
- `Puppeteer` - パペッティア
- `TimeThief` - タイムシーフ
- `EvilTracker` - イビルトラッカー
- `Stealth` - ステルス
- `NekoKabocha` - ネコカボチャ
- `EvilHacker` - イビルハッカー
- `Insider` - インサイダー
- `Bomber` - ボマー
- `TeleportKiller` - テレポートキラー
- `AntiReporter` - アンチレポーター
- `Tairou` - タイロウ
- `Evilgambler` - イビルギャンブラー
- `Notifier` - ノーティファイアー
- `Magician` - マジシャン
- `Decrescendo` - デクレッシェンド
- `Curser` - カーサー
- `Alien` - エイリアン
- `AlienHijack` - エイリアンハイジャック
- `SpeedStar` - スピードスター
- `EvilTeller` - イビルテラー
- `Limiter` - リミッター
- `ProgressKiller` - プログレスキラー
- `Mole` - モール
- `EvilAddoer` - イビルアドゥアー
- `Reloader` - リローダー
- `Jumper` - ジャンパー
- `EarnestWolf` - アーネストウルフ
- `Amnesiac` - アムネジアック
- `Camouflager` - カモフラージャー
- `ConnectSaver` - コネクトセーバー
- `EvilSatellite` - イビルサテライト
- `ProBowler` - プロボウラー
- `EvilMaker` - イビルメーカー
- `Eraser` - イレイサー
- `QuickKiller` - クイックキラー
- `CharismaStar` - カリスマスター
- `Ballooner` - バルーナー
- `BorderKiller` - ボーダーキラー
- `ShapeKiller` - シェイプキラー
- `Assassin` - アサシン（デバッグ用）

### マッドメイト（Madmate）

- `MadGuardian` - マッドガーディアン
- `Madmate` - マッドメイト（基本役職）
- `MadSnitch` - マッドスニッチ
- `MadAvenger` - マッドアベンジャー
- `SKMadmate` - SKマッドメイト
- `MadJester` - マッドジェスター
- `MadTeller` - マッドテラー
- `MadBait` - マッドベイト
- `MadReduced` - マッドリデュースド
- `MadWorker` - マッドワーカー
- `MadTracker` - マッドトラッカー
- `MadChanger` - マッドチェンジャー
- `MadSuicide` - マッドスーサイド
- `MadBetrayer` - マッドビトレイヤー
- `Nue` - ヌエ

### 第三陣営（Neutral）

- `Arsonist` - アーソニスト
- `Egoist` - エゴイスト
- `Jester` - ジェスター
- `Opportunist` - オポチュニスト
- `PlagueDoctor` - プレイグドクター
- `SchrodingerCat` - シュレディンガーキャット
- `Terrorist` - テロリスト
- `Executioner` - エグゼキューショナー
- `Jackal` - ジャッカル
- `Remotekiller` - リモートキラー
- `Chef` - シェフ
- `JackalMafia` - ジャッカルマフィア
- `CountKiller` - カウントキラー
- `GrimReaper` - グリムリーパー
- `Madonna` - マドンナ
- `Jackaldoll` - ジャッカルドール
- `Workaholic` - ワーカホリック
- `Monochromer` - モノクローマー
- `DoppelGanger` - ドッペルゲンガー
- `MassMedia` - マスメディア
- `Chameleon` - カメレオン
- `Banker` - バンカー
- `BakeCat` - ベイクキャット
- `Emptiness` - エンプティネス
- `JackalAlien` - ジャッカルエイリアン
- `CurseMaker` - カースメーカー
- `PhantomThief` - ファントムシーフ
- `Fox` - フォックス
- `Turncoat` - ターンコート
- `Vulture` - ヴァルチャー
- `SantaClaus` - サンタクロース
- `Missioneer` - ミッショニア
- `Strawdoll` - ストロードール
- `Fool` - フール
- `TaskPlayerB` - タスクプレイヤーB

### かくれんぼモード（HideAndSeek）

- `HASFox` - HASフォックス
- `HASTroll` - HASトロール

### その他

- `GM` - ゲームマスター
- `Driver` - ドライバー
- `Braid` - ブレイド
- `Vega` - ベガ
- `Altair` - アルタイル

---

## サブ役職（sub_roles）

サブ役職は配列で記録され、複数持つことができます。

### 基本サブ役職

- `NotAssigned` - 未割り当て
- `LastImpostor` - ラストインポスター
- `LastNeutral` - ラストニュートラル
- `Workhorse` - ワークホース
- `Twins` - ツインズ
- `OneWolf` - ワンウルフ

### 第三属性（恋人系）

- `Lovers` - 恋人（基本）
- `RedLovers` - 赤い恋人
- `YellowLovers` - 黄色い恋人
- `BlueLovers` - 青い恋人
- `GreenLovers` - 緑の恋人
- `WhiteLovers` - 白い恋人
- `PurpleLovers` - 紫の恋人
- `MadonnaLovers` - マドンナの恋人
- `OneLove` - ワンラブ
- `Amanojaku` - アマノジャク
- `Faction` - ファクション

### バフ（強化効果）

- `Guesser` - ゲッサー
- `Serial` - シリアル
- `Connecting` - コネクティング
- `Watching` - ウォッチング
- `PlusVote` - プラスボート
- `Tiebreaker` - タイブレイカー
- `Autopsy` - オートプシー
- `Revenger` - リベンジャー
- `Speeding` - スピーディング
- `Management` - マネジメント
- `Opener` - オープナー
- `Seeing` - シーイング
- `Lighting` - ライティング
- `Moon` - ムーン
- `Guarding` - ガーディング
- `MagicHand` - マジックハンド

### デバフ（弱体化効果）

- `Amnesia` - アムネジア
- `Notvoter` - ノットヴォーター
- `Elector` - エレクター
- `NonReport` - ノンレポート
- `Transparent` - トランスペアレント
- `Water` - ウォーター
- `Clumsy` - クラムジー
- `Slacker` - スラッカー
- `SlowStarter` - スロースターター
- `InfoPoor` - インフォプア

### ゴースト役職

#### マッドメイトゴースト

- `DemonicCrusher` - デモニッククラッシャー
- `DemonicTracker` - デモニックトラッカー
- `DemonicVenter` - デモニックベンター
- `DemonicSupporter` - デモニックサポーター

#### クルーメイトゴースト

- `Ghostbuttoner` - ゴーストボタナー
- `GhostNoiseSender` - ゴーストノイズセンダー
- `GhostReseter` - ゴーストリセッター
- `GuardianAngel` - ガーディアンエンジェル
- `GhostRumour` - ゴーストルーマー

#### 第三陣営ゴースト

- `AsistingAngel` - アシスティングエンジェル

---

## 使用例

### 単一メイン役職のみ

```json
{
  "role": {
    "main_role": "Crewmate",
    "sub_roles": []
  }
}
```

### メイン役職とサブ役職

```json
{
  "role": {
    "main_role": "Sheriff",
    "sub_roles": ["Lovers", "Guesser"]
  }
}
```

### インポスターとバフ

```json
{
  "role": {
    "main_role": "Impostor",
    "sub_roles": ["Serial", "Speeding"]
  }
}
```

### 第三陣営と恋人属性

```json
{
  "role": {
    "main_role": "Jester",
    "sub_roles": ["Lovers"]
  }
}
```

---

## 注意事項

1. **役職名の正確性**: ログに記録される役職名は、`CustomRoles` enum の値がそのまま文字列として出力されます。
2. **大文字小文字**: 役職名は厳密に大文字小文字が区別されます（例: `Sheriff` は正しいが `sheriff` は不正確）。
3. **バージョン依存**: 役職の追加や削除により、ログに記録される役職名は mod のバージョンによって変わる可能性があります。
4. **ゴースト役職**: ゴースト役職は死亡後に割り当てられる特殊な役職です。
5. **デバッグ役職**: 一部の役職（例: `Assassin`）はデバッグモードでのみ使用されます。

---

## ログスキーマバージョン

このドキュメントは、ログスキーマバージョン **2.0.0** に対応しています。

最終更新日: 2025年11月17日
