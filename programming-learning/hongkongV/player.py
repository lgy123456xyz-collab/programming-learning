class Player:
    def __init__(self, player_id, name, is_human=False):
        self.id = player_id
        self.name = name
        self.is_human = is_human
        self.wallet = 5000
        self.hand = []
        self.is_active = True
        self.current_bet = 0 # 本轮已投注额

    def reset_hand(self):
        self.hand = []
        self.is_active = True
        self.current_bet = 0