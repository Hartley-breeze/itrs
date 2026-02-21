# ml/generate_mock_data.py
import pandas as pd
import random

# 模拟用户和景点
users = [f"u{i}" for i in range(1, 11)]      # 10 个用户: u1, u2, ..., u10
items = [f"s{i}" for i in range(1, 21)]      # 20 个景点: s1, s2, ..., s20

# 生成 50 条随机评分（1～5 分）
data = []
for _ in range(50):
    user = random.choice(users)
    item = random.choice(items)
    rating = random.randint(1, 5)
    data.append([user, item, rating])

# 转为 DataFrame
df = pd.DataFrame(data, columns=["user_id", "item_id", "rating"])

# 去重（避免同一用户对同一景点多次评分）
df = df.drop_duplicates(subset=["user_id", "item_id"]).reset_index(drop=True)

# 保存为 CSV
df.to_csv("ratings.csv", index=False, encoding="utf-8")
print(f"✅ 已生成 {len(df)} 条评分数据，保存至 ratings.csv")
print(df.head(10))